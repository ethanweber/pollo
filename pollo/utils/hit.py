from dataclasses import dataclass


@dataclass
class HitMaker:
    """
    HIT class for storing HIT settings.
    """

    min_seconds_per_query_example: int = 1
    expected_seconds_per_query_example: int = 10
    image_height: int = 300
    image_max_width: int = 500
    endpoint: str = "https://pollo.ethanweber.me"

    def get_default_hit(self):
        """Get a hit with default settings."""
        hit = {}
        hit["settings"] = {}
        hit["settings"]["min_seconds_per_query_example"] = self.min_seconds_per_query_example
        hit["settings"]["expected_seconds_per_query_example"] = self.expected_seconds_per_query_example
        hit["settings"]["image_height"] = self.image_height
        hit["settings"]["image_max_width"] = self.image_max_width
        return hit
