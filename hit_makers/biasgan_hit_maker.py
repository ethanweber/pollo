from collections import defaultdict
import pandas as pd
from hit_makers.hit_maker import HitMaker
import goat
import os
import glob
import random
import numpy as np


class BiasganHitMaker(HitMaker):
    """
    """

    def __init__(self):
        super().__init__()
        self.choices = None
        self.quality_control_type = "ground_truth"
        self.quality_control_min_percent_correct = 0.8
        self.endpoint = "https://biasgan.ethanweber.me"
        self.project_name = "biasgan"
        self.expected_seconds_per_query_example = 5

    def get_hit(self,
                task,
                task_question,
                examples,
                gt_query_examples,
                query_examples):
        hit = super().get_hit()
        hit["settings"]["task"] = task  # name of task
        hit["settings"]["task_question"] = task_question  # question for task
        hit["settings"]["type"] = "choices"
        hit["settings"]["quality_control"] = {}
        hit["settings"]["quality_control"]["type"] = self.quality_control_type
        hit["settings"]["quality_control"]["min_percent_correct"] = self.quality_control_min_percent_correct

        hit["EXAMPLES"] = examples
        hit["GT_HIDDEN_EXAMPLES"] = gt_query_examples
        hit["QUERY_EXAMPLES"] = query_examples
        return hit

    def get_example(self, urls=None, url_labels=None, choices=None, answer=None, description=None):
        example = {}
        example["urls"] = urls
        if url_labels:
            example["url_labels"] = url_labels
        if choices:
            example["choices"] = choices
        if answer:
            example["answer"] = answer
        if description:
            example["description"] = description
        return example


class BiasganHitMakerRace(BiasganHitMaker):
    """Shown one image, provide the label.
    """

    def __init__(self):
        super().__init__()

    def get_processed_data_from_media_folder(self, media_folder):
        media_directory = goat.pjoin(goat.io_utils.get_git_root(os.path.abspath(__file__)), "static/data/media")
        task_question = goat.io_utils.load_from_txt(goat.pjoin(media_directory, media_folder, "task_question.txt"))[0]
        choices = list(pd.read_csv(goat.pjoin(media_directory, media_folder, "choices.csv"))["choices"])
        # populate the examples
        examples = []
        d = pd.read_csv(goat.pjoin(media_directory, media_folder, "examples.csv"))
        for image, label, reason in zip(d["image"], d["label"], d["reason"]):
            url = os.path.join(self.endpoint, "static/data/media", media_folder, "examples", image)
            examples.append(self.get_example(urls=[url], choices=choices, answer=label, description=reason))
        # populate the gt query examples
        gt_query_examples = []
        d = pd.read_csv(goat.pjoin(media_directory, media_folder, "ground_truth.csv"))
        for image, label in zip(d["image"], d["label"]):
            url = os.path.join(self.endpoint, "static/data/media", media_folder, "ground_truth", image)
            gt_query_examples.append(self.get_example(urls=[url], choices=choices, answer=label, description=None))
        # populate the query examples
        query_folder_to_query_examples = defaultdict(list)
        for query_folder in os.listdir(goat.pjoin(media_directory, media_folder, "query")):
            for image in os.listdir(goat.pjoin(media_directory, media_folder, "query", query_folder)):
                url = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folder, image)
                query_folder_to_query_examples[query_folder].append(self.get_example(
                    urls=[url], choices=choices, answer=None, description=None))
        query_folder_to_query_examples = dict(query_folder_to_query_examples)
        return {
            "task": "Task1_Race_Classification",
            "task_question": task_question,
            "examples": examples,
            "gt_query_examples": gt_query_examples,
            "query_folder_to_query_examples": query_folder_to_query_examples,
        }


class BiasganHitMakerQuality(BiasganHitMaker):
    """Shown one image, provide the label.
    """

    def __init__(self):
        super().__init__()
        self.choices = ["Low quality", "High quality"]

    def get_processed_data_from_media_folder(self, media_folder):
        media_directory = goat.pjoin(goat.io_utils.get_git_root(os.path.abspath(__file__)), "static/data/media")
        task_question = goat.io_utils.load_from_txt(goat.pjoin(media_directory, media_folder, "task_question.txt"))[0]
        choices = list(pd.read_csv(goat.pjoin(media_directory, media_folder, "choices.csv"))["choices"])
        # populate the examples
        examples = []
        d = pd.read_csv(goat.pjoin(media_directory, media_folder, "examples.csv"))
        for image, label, reason in zip(d["image"], d["label"], d["reason"]):
            url = os.path.join(self.endpoint, "static/data/media", media_folder, "examples", image)
            examples.append(self.get_example(urls=[url], choices=choices, answer=label, description=reason))
        # populate the gt query examples
        gt_query_examples = []
        d = pd.read_csv(goat.pjoin(media_directory, media_folder, "ground_truth.csv"))
        for image, label in zip(d["nn"], d["label"]):
            url = os.path.join(self.endpoint, "static/data/media", media_folder, "ground_truth", image)
            gt_query_examples.append(self.get_example(urls=[url], choices=choices, answer=label, description=None))
        # populate the query examples
        query_folder_to_query_examples = defaultdict(list)
        for query_folder in os.listdir(goat.pjoin(media_directory, media_folder, "query")):
            if query_folder not in ["ffhq_trunc_0.5", "ffhq_trunc_0.75", "ffhq_trunc1"]:
                continue
            for image in os.listdir(goat.pjoin(media_directory, media_folder, "query", query_folder)):
                url = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folder, image)
                query_folder_to_query_examples[query_folder].append(self.get_example(
                    urls=[url], choices=choices, answer=None, description=None))
        query_folder_to_query_examples = dict(query_folder_to_query_examples)
        return {
            "task": "Task2_Real_Fake_Classification",
            "task_question": task_question,
            "examples": examples,
            "gt_query_examples": gt_query_examples,
            "query_folder_to_query_examples": query_folder_to_query_examples,
        }


class BiasganHitMakerBetter(BiasganHitMaker):
    """Shown two images (0 or 1), provide the label.
    I'd avoid "left" or "right" notation because this depends on how
    the HTML is formatted for a given screen size.
    """

    def __init__(self):
        super().__init__()
        self.choices = ["0", "1"]

    def get_processed_data_from_media_folder(self, media_folder):
        media_directory = goat.pjoin(goat.io_utils.get_git_root(os.path.abspath(__file__)), "static/data/media")
        task_question = goat.io_utils.load_from_txt(goat.pjoin(media_directory, media_folder, "task_question.txt"))[0]
        choices = list(pd.read_csv(goat.pjoin(media_directory, media_folder, "choices.csv"))["choices"])
        # populate the examples
        examples = []
        d = pd.read_csv(goat.pjoin(media_directory, media_folder, "query_examples.csv"))
        for imageA, imageB, label, reason in zip(d["imageA"], d["imageB"], d["label"], d["reason"]):
            urlA = os.path.join(self.endpoint, "static/data/media", media_folder, "examples", imageA)
            urlB = os.path.join(self.endpoint, "static/data/media", media_folder, "examples", imageB)
            examples.append(self.get_example(urls=[urlA, urlB], url_labels=[
                            "Image A", "Image B"], choices=choices, answer=label, description=reason))
        # populate the gt query examples
        gt_query_examples = []
        d = pd.read_csv(goat.pjoin(media_directory, media_folder, "ground_truth.csv"))
        for imageA, imageB, label in zip(d["image A"], d["image B"], d["label"]):
            urlA = os.path.join(self.endpoint, "static/data/media", media_folder, "ground_truth", imageA)
            urlB = os.path.join(self.endpoint, "static/data/media", media_folder, "ground_truth", imageB)
            gt_query_examples.append(self.get_example(
                urls=[urlA, urlB], url_labels=["Image A", "Image B"], choices=choices, answer=label, description=None))
        # populate the query examples for INTRA
        # d = pd.read_csv(goat.pjoin(media_directory, media_folder, "intersplit_ranking_query.csv"))

        a_ids = np.arange(1000)
        b_ids = np.arange(1000)
        c_ids = np.arange(1000)

        a3_ids = np.concatenate([a_ids, a_ids, a_ids])
        a3_ids_2 = np.concatenate([a_ids, a_ids, a_ids])
        b3_ids = np.concatenate([b_ids, b_ids, b_ids])
        c3_ids = np.concatenate([c_ids, c_ids, c_ids])

        np.random.shuffle(a3_ids)
        np.random.shuffle(a3_ids_2)
        np.random.shuffle(b3_ids)
        np.random.shuffle(c3_ids)

        query_folder_to_query_examples = defaultdict(list)
        for query_folder in os.listdir(goat.pjoin(media_directory, media_folder, "query")):
            # intra for each query folder
            if query_folder not in ["ffhq_trunc_0.5", "ffhq_trunc_0.75", "ffhq_trunc1"]:
                continue
            for a_1, a_2 in zip(list(a3_ids), list(a3_ids_2)):
                imageA = "seed{:04d}.png".format(a_1)
                imageB = "seed{:04d}.png".format(a_2)
                urlA = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folder, imageA)
                urlB = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folder, imageB)
                urls = [urlA, urlB]
                random.shuffle(urls)
                query_folder_to_query_examples[query_folder].append(self.get_example(
                    urls=urls, url_labels=["Image A", "Image B"], choices=choices, answer=None, description=None))
        query_folder_to_query_examples = dict(query_folder_to_query_examples)
        # populate the query examples for INTER

        query_folder_query_folder_to_query_examples = defaultdict(list)
        # first batch
        
        # query_folders = ["black20_white80", "black50_white50", "black80_white20"]
        query_folders = ["ffhq_trunc_0.5", "ffhq_trunc_0.75", "ffhq_trunc1"]
        
        for a_id, b_id in zip(a3_ids, b3_ids):
            imageA = "seed{:04d}.png".format(a_id)
            imageB = "seed{:04d}.png".format(b_id)
            urlA = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folders[0], imageA)
            urlB = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folders[1], imageB)
            urls = [urlA, urlB]
            random.shuffle(urls)
            query_folder_query_folder_to_query_examples[query_folders[0] + "_" + query_folders[1]].append(self.get_example(
                    urls=urls, url_labels=["Image A", "Image B"], choices=choices, answer=None, description=None))

        # second batch
        for a_id, c_id in zip(a3_ids, c3_ids):
            imageA = "seed{:04d}.png".format(a_id)
            imageB = "seed{:04d}.png".format(c_id)
            urlA = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folders[0], imageA)
            urlB = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folders[2], imageB)
            urls = [urlA, urlB]
            random.shuffle(urls)
            query_folder_query_folder_to_query_examples[query_folders[0] + "_" + query_folders[2]].append(self.get_example(
                    urls=urls, url_labels=["Image A", "Image B"], choices=choices, answer=None, description=None))

        # third batch
        for b_id, c_id in zip(b3_ids, c3_ids):
            imageA = "seed{:04d}.png".format(b_id)
            imageB = "seed{:04d}.png".format(c_id)
            urlA = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folders[1], imageA)
            urlB = os.path.join(self.endpoint, "static/data/media", media_folder, "query", query_folders[2], imageB)
            urls = [urlA, urlB]
            random.shuffle(urls)
            query_folder_query_folder_to_query_examples[query_folders[1] + "_" + query_folders[2]].append(self.get_example(
                    urls=urls, url_labels=["Image A", "Image B"], choices=choices, answer=None, description=None))

        return {
            "task": "Task3_Quality_Ranking",
            "task_question": task_question,
            "examples": examples,
            "gt_query_examples": gt_query_examples,
            "query_folder_to_query_examples": query_folder_to_query_examples,
            "query_folder_query_folder_to_query_examples": query_folder_query_folder_to_query_examples
        }


task_to_class = {
    "Task1_Race_Classification": BiasganHitMakerRace,
    "Task2_Real_Fake_Classification": BiasganHitMakerQuality,
    "Task3_Quality_Ranking": BiasganHitMakerBetter,
}
