import os
import goat


class HitMaker():
    """
    """

    def __init__(self,
                 min_seconds_per_query_example=1,
                 image_height=300,
                 image_max_width=500):
        self.min_seconds_per_query_example = min_seconds_per_query_example
        self.image_height = image_height
        self.image_max_width = image_max_width

    def get_hit(self):
        hit = {}
        hit["settings"] = {}
        hit["settings"]["min_seconds_per_query_example"] = self.min_seconds_per_query_example
        hit["settings"]["image_height"] = self.image_height
        hit["settings"]["image_max_width"] = self.image_max_width
        return hit

    def validate_hit(self, hit):
        assert hit["settings"]["quality_control"]["type"] in ["ground_truth", "consistency_check"]
        assert 0.0 <= hit["settings"]["quality_control"]["min_percent_correct"] <= 1.0

    def save(self, hit_name, hit):
        self.validate_hit(hit)
        filename = goat.pjoin(goat.io_utils.get_git_root(os.path.abspath(__file__)),
                              "static/data/hits", hit_name + ".json")
        goat.make_dir(filename)
        goat.write_to_json(filename, hit)
