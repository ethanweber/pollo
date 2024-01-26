import json
import os
import pickle
import pprint

import boto3
import numpy as np
import xmltodict
from tqdm import tqdm
from pollo.utils.io import get_absolute_path, make_dir, write_to_json

PUBLIC_URL = "https://friends.ethanweber.me"


class Requester(object):
    """Class to handle all the MTurk API functions/requests."""

    def __init__(self, use_sandbox=True, database_filename=None, creds_filename=None):
        self.use_sandbox = use_sandbox
        self.worker_requirements = self.get_worker_requirements()
        self.task_attributes = None

        assert database_filename is not None, "Please set the `database_filename`"
        assert creds_filename is not None, "Please set the `creds_filename`"
        self.database_filename = database_filename
        self.creds_filename = creds_filename
        try:
            self.database = pickle.load(open(self.database_filename, "rb"))
        except:
            self.database = {"sandbox": {}, "production": {}}
            print("No database found. Initializing it to:")
            pprint.pprint(self.database)

        # setup the client
        self.mturk_environment = None
        self.client = None
        self.set_client()

    def set_client(self):
        # load the mturk credentials
        with open(self.creds_filename) as json_file:
            mturk_creds = json.load(json_file)

        environments = {
            "production": {
                "endpoint": "https://mturk-requester.us-east-1.amazonaws.com",
                "preview": "https://www.mturk.com/mturk/preview",
            },
            "sandbox": {
                "endpoint": "https://mturk-requester-sandbox.us-east-1.amazonaws.com",
                "preview": "https://workersandbox.mturk.com/mturk/preview",
            },
        }

        self.mturk_environment = environments["sandbox"] if self.use_sandbox else environments["production"]
        self.client = boto3.client(
            service_name="mturk",
            region_name="us-east-1",
            endpoint_url=self.mturk_environment["endpoint"],
            aws_access_key_id=mturk_creds["aws_access_key_id"],
            aws_secret_access_key=mturk_creds["aws_secret_access_key"],
        )

    def set_task_attributes(self, task_attributes):
        """See https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/mturk-hits-attributes.html for more details.
        Example below:
            task_attributes = {
                'MaxAssignments': 1,
                # How long the task will be available on MTurk
                'LifetimeInSeconds': 60 * 60 * lifetime_hours,
                # How long Workers have to complete each item
                'AssignmentDurationInSeconds': 60 * per_hit_minutes,
                # The reward you will offer Workers for each response
                'Reward': cost_per_hit,
                'Title': 'Choosing humans in sitcoms. (~{} min)'.format(per_hit_minutes),
                'Keywords': 'video, choice, person, computer vison, selection',
                'Description': 'Choose which of the two videos has the better placed person.'
            }
        """
        self.task_attributes = task_attributes

    def get_worker_requirements(self):
        """Currently set for masters level."""
        worker_requirements = []
        if not self.use_sandbox:
            # https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html
            # 1K hits
            # worker_requirements.append(
            #     {
            #         "QualificationTypeId": "00000000000000000040",
            #         "Comparator": "GreaterThan",
            #         "IntegerValues": [1000]
            #     }
            # )
            # # approval percentage above 90%
            # worker_requirements.append(
            #     {
            #         "QualificationTypeId": "000000000000000000L0",
            #         "Comparator": "GreaterThan",
            #         "IntegerValues": [90]
            #     }
            # )
            # masters qualification
            worker_requirements.append(
                {"QualificationTypeId": "2F1QJWKUDD8XADTFD2Q0G6UTO95ALH", "Comparator": "Exists"}
            )
        return worker_requirements

    def show_account_balance(self):
        print(self.client.get_account_balance()["AvailableBalance"])

    def submit_hit_with_external_url(self, external_url):
        if external_url in self.database[self.get_sandox_key()]:
            raise ValueError("you potentially already submitted this!")
        question_xml = """
            <ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
               <ExternalURL>{}</ExternalURL>
               <FrameHeight>1000</FrameHeight>
            </ExternalQuestion>""".format(
            external_url
        )
        response = self.client.create_hit(
            **self.task_attributes, Question=question_xml, QualificationRequirements=self.worker_requirements
        )
        hit_id = response["HIT"]["HITId"]
        # update database
        try:
            info = {"use_sandbox": self.use_sandbox, "external_url": external_url, "hit_id": hit_id, "response": None}
            # update database
            self.database[self.get_sandox_key()][hit_id] = info
        except:
            raise ValueError("HIT did not submit properly.")

        # write database
        pickle.dump(self.database, open(self.database_filename, "wb"))
        return hit_id

    def submit_hits_from_external_urls(self, external_urls):
        hit_ids = []
        for external_url in tqdm(external_urls):
            hit_id = self.submit_hit_with_external_url(external_url)
            hit_ids.append(hit_id)
        return hit_ids

    def write_database(self):
        pickle.dump(self.database, open(self.database_filename, "wb"))

    def get_url_to_view_hit(self, hit_id):
        response = self.client.get_hit(HITId=hit_id)
        hit_type_id = response["HIT"]["HITTypeId"]
        return self.mturk_environment["preview"] + "?groupId={}".format(hit_type_id)

    def get_sandox_key(self):
        return "sandbox" if self.use_sandbox else "production"

    def get_responses_from_database(self):
        responses = {}
        for hit_id in self.database[self.get_sandox_key()].keys():
            if self.database[self.get_sandox_key()][hit_id]["use_sandbox"] and not self.use_sandbox:
                continue
            info = self.database[self.get_sandox_key()][hit_id]
            response = info["response"]
            if response is not None:
                responses[hit_id] = response
        return responses

    def update_database_with_responses(self):
        # go through the hits
        for hit_id in tqdm(self.database[self.get_sandox_key()].keys()):
            # hit_id = self.database[self.get_sandox_key()][external_url]["hit_id"]
            # only consider sandbox or non sandbox
            if self.database[self.get_sandox_key()][hit_id]["use_sandbox"] and not self.use_sandbox:
                continue
            assignments_list = self.client.list_assignments_for_hit(HITId=hit_id, MaxResults=100)
            if assignments_list["NumResults"] == 0:
                print("No results.")
                continue
            else:
                assert len(assignments_list["Assignments"]) >= 1
            # if self.database[self.get_sandox_key()][hit_id]["response"] is None:
            answers = []
            # NOTE(ethan): notice that now we have multiple responses...
            # assert assignments_list["NumResults"] == 3
            for idx in range(assignments_list["NumResults"]):
                # print("something")
                answer_dict = xmltodict.parse(assignments_list["Assignments"][idx]["Answer"])
                AssignmentId = assignments_list["Assignments"][idx]["AssignmentId"]
                answer = answer_dict["QuestionFormAnswers"]["Answer"]["FreeText"]
                answer = json.loads(answer)
                answer["AssignmentId"] = AssignmentId
                answers.append(answer)
            self.database[self.get_sandox_key()][hit_id]["response"] = answers
        # write database
        self.write_database()

    def get_external_urls_from_hit_names(self, hit_names):
        external_urls = []
        for hit_name in hit_names:
            external_urls.append("{}/mturk/{}".format(PUBLIC_URL, hit_name))
        return external_urls

    def save_mturk_parsed_results_to_file(self, response_list):
        """Save the HIT to file."""
        # TODO(ethan): need to update to support multiple assignments from "MaxAssignments"
        assert len(response_list) == 1
        filename = get_absolute_path(
            os.path.join("static/data/responses", response_list[0]["GLOBAL_CONFIG_NAME"] + ".json")
        )
        make_dir(filename)
        write_to_json(filename, response_list[0])

    def save_all_responses_to_files(self, responses):
        for hit_id in tqdm(responses.keys()):
            self.save_mturk_parsed_results_to_file(responses[hit_id])

    def get_mean_time_from_resonses(self, responses):
        times = []
        for hit_id in responses:
            for i in range(len(responses[hit_id])):
                t = float(responses[hit_id][i]["GLOBAL_REAL_TEST_TIME"])
                times.append(t)
        times = np.array(times)
        return times.mean()


# approve the hits
# from tqdm import tqdm
# import pprint
# for item in tqdm(requester.database["production"].values()):
#     hit_id = item["hit_id"]
# #     print(hit_id)
# #     pprint.pprint(requester.client.get_hit(HITId=hit_id))
#     assignments_list = requester.client.list_assignments_for_hit(
#         HITId=hit_id,
#         MaxResults=1
#     )
#     assert len(assignments_list["Assignments"]) <= 1
#     if len(assignments_list["Assignments"]) == 1:
#         assignment_id = assignments_list["Assignments"][0]["AssignmentId"]
#         if assignments_list["Assignments"][0]["AssignmentStatus"] == "Submitted":
#             requester.client.approve_assignment(
#                 AssignmentId=assignment_id,
#                 RequesterFeedback='Thank you for doing this HIT.'
#             )


# myoutputs = []
# for res in responses:
#     url = res.replace("mturk", "responses")
#     myoutputs.append((url, responses[res]["GLOBAL_REAL_TEST_TIME"]))
# myoutputs = sorted(myoutputs, key=lambda x: x[1])


# import datetime
# from dateutil.tz import tzlocal
# start_date = datetime.datetime(2020, 5, 1, tzinfo=tzlocal())
#
# all_hits = []
# hits = requester.client.list_hits(MaxResults=100)
# all_hits += hits["HITs"]
# while "NextToken" in hits.keys():
#     hits = requester.client.list_hits(NextToken=hits["NextToken"], MaxResults=100)
#     all_hits += hits["HITs"]
#
#
# hit_ids = []
# external_urls = []
# for hit in all_hits:
#     if hit["CreationTime"] > start_date:
#         hit_ids.append(hit["HITId"])
#         external_urls.append(xmltodict.parse(hit["Question"])["ExternalQuestion"]["ExternalURL"])


# import datetime
# for hit_id in hit_ids:
#     print('HITId:', hit_id)

#     # Get HIT status
#     status=requester.client.get_hit(HITId=hit_id)['HIT']['HITStatus']
#     print('HITStatus:', status)

#     # If HIT is active then set it to expire immediately
#     if status=='Assignable':
#         response = requester.client.update_expiration_for_hit(
#             HITId=hit_id,
#             ExpireAt=datetime.datetime(2015, 1, 1)
#         )

#     # Delete the HIT
#     try:
#         mturk.delete_hit(HITId=hit_id)
#     except:
#         print('Not deleted')
#     else:
#         print('Deleted')
