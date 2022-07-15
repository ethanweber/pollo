"""Script to run for the frontend.
This will enable access to a few important endpoints:
    /hits
    /get_responses
    /mturk
    /responses
The last two are particularly important.
"""

import argparse
from flask import (Flask,
                   jsonify,
                   request)
import os
import json
import string
import random
from os.path import join as pjoin

from anno.utils.io import make_dir, load_from_json, write_to_json

parser = argparse.ArgumentParser(description="")
parser.add_argument("--port", type=int, default=8893, help="Port to run on")


def current_path():
    return os.path.dirname(os.path.abspath(__file__))


CONFIG_TYPE = "pickn"
STATIC_FOLDER = pjoin(current_path(), "static")
HIT_FOLDER = pjoin(STATIC_FOLDER, "data/hits")
LOCAL_RESPONSE_FOLDER = pjoin(STATIC_FOLDER, "data/local_responses")
RESPONSE_FOLDER = pjoin(STATIC_FOLDER, "data/responses")
# make these folders if they do not exist
make_dir(STATIC_FOLDER)
make_dir(HIT_FOLDER)
make_dir(LOCAL_RESPONSE_FOLDER)
make_dir(RESPONSE_FOLDER)

app = Flask(__name__, static_url_path="/static", static_folder=STATIC_FOLDER)
app.jinja_env.filters['zip'] = zip

# Get the config paramters for HIT.


@app.route('/', methods=["GET"])
def root():
    return "The server is working, but this endpoint isn't useful."


@app.route('/mturk/externalSubmit', methods=["POST"])
def submit_external_submit():
    """Get submitted mturk data locally."""
    import pprint
    pprint.pprint(request)
    print(request.headers)
    print()
    content = request.form.to_dict()
    print(type(content))
    pprint.pprint(content)

    content["answer"] = json.loads(content["answer"])
    config_name = content["answer"]["GLOBAL_CONFIG_NAME"]

    fake_AssignmentId = ''.join(random.choice(string.ascii_lowercase) for i in range(6))
    filename = os.path.join(LOCAL_RESPONSE_FOLDER, config_name + f"-{fake_AssignmentId}.json")
    write_to_json(filename, content["answer"])
    return jsonify({"info": "saved to {}".format(filename)})


# Get the config paramters for HIT.
@app.route('/hits/<config_name>', methods=["GET"])
def hits(config_name):
    config_data = load_from_json(os.path.join(HIT_FOLDER, config_name + ".json"))
    return jsonify(config_data)


# Get the config paramters for HIT.
@app.route('/get_responses/<config_name>', methods=["GET"])
def get_responses(config_name):
    config_data = load_from_json(os.path.join(RESPONSE_FOLDER, config_name + ".json"))
    return jsonify(config_data)

# Get the config paramters for HIT.


@app.route('/get_local_responses/<config_name>', methods=["GET"])
def get_local_responses(config_name):
    config_data = load_from_json(os.path.join(LOCAL_RESPONSE_FOLDER, config_name + ".json"))
    return jsonify(config_data)

#########
# FOR THE QUALITATIVE USER STUDY TASKS

# The MTurk task. <config_name> is used to specify the .json file config, specifying the task.


@app.route('/interface/<config_name>', methods=["GET"])
def interface(config_name):
    with open("web/pages/interface.html", 'r') as file:
        html_as_str = file.read()
    modified_html = html_as_str.replace("${CONFIG_TYPE}", CONFIG_TYPE)
    modified_html = modified_html.replace("${CONFIG_NAME}", config_name)
    return modified_html

# Look at the responses from MTurk to see how people responded.


@app.route('/responses/<config_name>', methods=["GET"])
def responses(config_name):
    with open("web/pages/responses.html", 'r') as file:
        html_as_str = file.read()
    modified_html = html_as_str.replace("${CONFIG_TYPE}", CONFIG_TYPE)
    modified_html = modified_html.replace("${CONFIG_NAME}", config_name)
    return modified_html
#########


if __name__ == '__main__':
    print("running server")
    args = parser.parse_args()
    app.run(debug=False, threaded=True, host="0.0.0.0", port=args.port)
