import os
import goat


class HitMaker():
    """
    """

    def __init__(self,
                 min_seconds_per_query_example=1):
        self.min_seconds_per_query_example = min_seconds_per_query_example

    def get_hit(self):
        hit = {}
        hit["settings"] = {}
        hit["settings"]["min_seconds_per_query_example"] = self.min_seconds_per_query_example
        return hit

    def save(self, hit_name, hit):
        filename = goat.pjoin(goat.io_utils.get_git_root(os.path.abspath(__file__)), "static/data/hits", hit_name + ".json")
        goat.make_dir(filename)
        goat.write_to_json(filename, hit)
