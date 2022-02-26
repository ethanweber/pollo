from hit_makers.hit_maker import HitMaker


class BiasganHitMaker(HitMaker):
    """
    """

    def __init__(self):
        super().__init__()
        self.choices = None
        self.quality_control_type = "ground_truth"
        self.quality_control_min_percent_correct = 0.8

    def get_hit(self,
                examples,
                gt_query_examples,
                query_examples):
        hit = super().get_hit()
        hit["settings"]["type"] = "choices"
        hit["settings"]["quality_control"] = {}
        hit["settings"]["quality_control"]["type"] = self.quality_control_type
        hit["settings"]["quality_control"]["min_percent_correct"] = self.quality_control_min_percent_correct

        hit["EXAMPLES"] = examples
        hit["GT_HIDDEN_EXAMPLES"] = gt_query_examples
        hit["QUERY_EXAMPLES"] = query_examples
        return hit


class BiasganHitMakerRace(BiasganHitMaker):
    """Shown one image, provide the label.
    """

    def __init__(self):
        super().__init__()

    def get_example(self, urls, choices=None, answer=None, descriptions=None):
        example = {}
        example["urls"] = urls
        if choices:
            example["choices"] = choices
        if answer:
            example["answer"] = answer
        if descriptions:
            example["descriptions"] = descriptions
        return example

class BiasganHitMakerQuality(BiasganHitMaker):
    """Shown one image, provide the label.
    """

    def __init__(self):
        super().__init__()
        self.choices = ["Low quality", "High quality"]


class BiasganHitMakerBetter(BiasganHitMaker):
    """Shown two images (0 or 1), provide the label.
    I'd avoid "left" or "right" notation because this depends on how
    the HTML is formatted for a given screen size.
    """

    def __init__(self):
        super().__init__()
        self.choices = ["0", "1"]


task_to_class = {
    0: BiasganHitMakerRace,
    1: BiasganHitMakerQuality,
    2: BiasganHitMakerBetter,
}
