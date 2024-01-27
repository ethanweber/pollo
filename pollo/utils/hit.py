import os

from os.path import join as pjoin
import pollo.utils.io as io_utils


class HitMaker:
    """
    """

    def __init__(self,
                 min_seconds_per_query_example=1,
                 expected_seconds_per_query_example=10,
                 image_height=300,
                 image_max_width=500,
                 endpoint="https://pollo.ethanweber.me"):
        self.min_seconds_per_query_example = min_seconds_per_query_example
        self.expected_seconds_per_query_example = expected_seconds_per_query_example
        self.image_height = image_height
        self.image_max_width = image_max_width
        self.endpoint = endpoint
        # self.project_name = None # needs to be set from a child class

    def get_hit(self):
        hit = {}
        hit["settings"] = {}
        hit["settings"]["min_seconds_per_query_example"] = self.min_seconds_per_query_example
        hit["settings"]["expected_seconds_per_query_example"] = self.expected_seconds_per_query_example
        hit["settings"]["image_height"] = self.image_height
        hit["settings"]["image_max_width"] = self.image_max_width
        return hit

    def validate_hit(self, hit):
        assert hit["settings"]["quality_control"]["type"] in ["ground_truth", "consistency_check"]
        assert 0.0 <= hit["settings"]["quality_control"]["min_percent_correct"] <= 1.0

    def save(self, hit_name, hit):
        self.validate_hit(hit)
        # assert self.project_name is not None
        filename = pjoin(io_utils.get_git_root(os.path.abspath(__file__)),
                         "static/data/hits", hit_name + ".json")
        assert not os.path.exists(filename), filename
        io_utils.make_dir(filename)
        io_utils.write_to_json(filename, hit)
