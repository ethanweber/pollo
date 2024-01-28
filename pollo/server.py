"""Script to run for the frontend.
The endpoints are defined in the EndpointHandler class.
"""

import argparse
import json
import mimetypes
import os
import pprint
import random
import string

from flask import Flask, jsonify, request, send_from_directory

from pollo.utils.io import load_from_json, write_to_json


parser = argparse.ArgumentParser(description="")
parser.add_argument("--port", type=int, default=40110, help="Port to run on")
parser.add_argument("--data-folder", type=str, default="./data", help="Relative data folder path")

CONFIG_TYPE = "pickn"


class EndpointHandler:
    """Server class."""

    def __init__(self, app: str, data_folder: str, pages_folder: str):
        self.app = app
        self.data_folder = data_folder
        self.pages_folder = pages_folder

        @self.app.route("/", methods=["GET"])
        def root():
            return "The server is working, but this endpoint isn't defined."

        @self.app.route("/mturk/externalSubmit", methods=["POST"])
        def submit_external_submit():
            """Get submitted mturk data locally."""

            pprint.pprint(request)
            print(request.headers)
            print()
            content = request.form.to_dict()
            print(type(content))
            pprint.pprint(content)

            content["answer"] = json.loads(content["answer"])
            config_name = content["answer"]["GLOBAL_CONFIG_NAME"]

            fake_assignment_id = "".join(random.choice(string.ascii_lowercase) for i in range(6))
            filename = os.path.join(self.data_folder, "local_responses", config_name + f"-{fake_assignment_id}.json")
            write_to_json(filename, content["answer"])
            return jsonify({"info": "saved to {}".format(filename)})

        @self.app.route("/hits/<config_name>", methods=["GET"])
        def hits(config_name):
            filename = os.path.join(self.data_folder, "hits", config_name + ".json")
            config_data = load_from_json(filename)
            return jsonify(config_data)

        @app.route("/local_responses/<config_name>", methods=["GET"])
        def local_responses(config_name):
            config_data = load_from_json(os.path.join(self.data_folder, "local_responses", config_name + ".json"))
            return jsonify(config_data)

        @app.route("/media/<path:media_name>", methods=["GET"])
        def media(media_name):
            media_folder = os.path.join(self.data_folder, "media")
            media_path = os.path.join(media_folder, media_name)

            # Ensure the file exists
            if not os.path.isfile(media_path):
                return "File not found", 404

            # Determine the MIME type of the file
            mime_type, _ = mimetypes.guess_type(media_path)
            if not mime_type:
                mime_type = "application/octet-stream"

            return send_from_directory(media_folder, media_name, mimetype=mime_type)

        @self.app.route("/responses/<config_name>", methods=["GET"])
        def responses(config_name):
            config_data = load_from_json(os.path.join(self.data_folder, "responses", config_name + ".json"))
            return jsonify(config_data)

        # FOR THE QUALITATIVE USER STUDY TASKS
        # The MTurk task. <config_name> is used to specify the .json file config, specifying the task.
        @self.app.route("/hits-interface/<config_name>", methods=["GET"])
        def hits_interface(config_name):
            with open(os.path.join(pages_folder, "interface.html"), "r", encoding="utf-8") as file:
                html_as_str = file.read()
            modified_html = html_as_str.replace("${CONFIG_TYPE}", CONFIG_TYPE)
            modified_html = modified_html.replace("${CONFIG_NAME}", config_name)
            return modified_html

        # Look at the responses from MTurk to see how people responded.
        @self.app.route("/responses-interface/<config_name>", methods=["GET"])
        def responses_interface(config_name):
            with open(os.path.join(pages_folder, "responses.html"), "r", encoding="utf-8") as file:
                html_as_str = file.read()
            modified_html = html_as_str.replace("${CONFIG_TYPE}", CONFIG_TYPE)
            modified_html = modified_html.replace("${CONFIG_NAME}", config_name)
            return modified_html

        # Look at the responses from MTurk to see how people responded.
        @self.app.route("/local_responses-interface/<config_name>", methods=["GET"])
        def local_responses_interface(config_name):
            with open(os.path.join(pages_folder, "local_responses.html"), "r", encoding="utf-8") as file:
                html_as_str = file.read()
            modified_html = html_as_str.replace("${CONFIG_TYPE}", CONFIG_TYPE)
            modified_html = modified_html.replace("${CONFIG_NAME}", config_name)
            return modified_html


if __name__ == "__main__":
    print("running server")
    args = parser.parse_args()

    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web/static")
    pages_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web/pages")

    # turn relative args.data_folder into absolute path from where the command is run
    data_folder = os.path.abspath(args.data_folder)

    app = Flask(__name__, static_url_path="/static", static_folder=static_folder)
    app.jinja_env.filters["zip"] = zip

    handler = EndpointHandler(
        app,
        data_folder=data_folder,
        pages_folder=pages_folder,
    )

    app.run(debug=False, threaded=True, host="0.0.0.0", port=args.port)
