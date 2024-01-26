"""
NOTE: this code requires extra data from the 'friends' project to run.
"""

import os
import random

from pollo.hit_makers.base import HitMaker


class FriendsHitMaker(HitMaker):
    """Class for creating HITs.
    """

    def __init__(self):
        pass

    @staticmethod
    def get_example_from_human_key(human_key,
                                   human_key_to_paired_key,
                                   human_key_to_bbox,
                                   MOVIE_FOLDER,
                                   IMAGE_FOLDER,
                                   randomize=True,
                                   method_str="SF-CS",
                                   description=None):
        """
        """
        methods = method_str.split("-")
        human_key_str = get_human_key_str(human_key)

        video_url_0 = os.path.join(MOVIE_FOLDER, human_key_str + "-" + methods[0] + ".mp4")
        video_url_1 = os.path.join(MOVIE_FOLDER, human_key_str + "-" + methods[1] + ".mp4")

        # the shot changes images
        paired_key = human_key_to_paired_key[human_key]
        image_path_l = human_key[0] + ".jpg"
        image_path_r = paired_key[0] + ".jpg"

        image_url_l = os.path.join(IMAGE_FOLDER, image_path_l)
        image_url_r = os.path.join(IMAGE_FOLDER, image_path_r)

        bbox_l = human_key_to_bbox[human_key]
        # bbox_r = human_key_to_bbox[paired_key]
        bbox_r = None

        images_and_boxes = [
            [image_url_l, bbox_l],
            [image_url_r, bbox_r],
        ]
        choices = [video_url_0, video_url_1]
        if randomize:
            random.shuffle(choices)
        example = FriendsHitMaker.get_example(images_and_boxes, choices, description=description)
        return example

    @staticmethod
    def get_example(images_and_boxes, choices, description=None):
        example = {}
        example["images_and_boxes"] = images_and_boxes
        example["choices"] = choices
        if description is not None:
            example["description"] = description
        return example

    @staticmethod
    def get_hit(examples, gt_query_examples, query_examples):
        """Number of questions will be (gt_query_examples * 2 + query_examples)
        """
        hit = {}
        hit["TYPE"] = "pickn"
        hit["EXAMPLES"] = examples
        hit["GT_HIDDEN_EXAMPLES"] = gt_query_examples  # these are also flipped around, so 2x!!
        hit["QUERY_EXAMPLES"] = query_examples
        return hit
