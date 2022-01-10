from .hit_maker import HitMaker

class IncidentsHitMaker(HitMaker):
    """Class for creating HITs.
    """

    def __init__(self):
        pass

    @staticmethod
    def get_example():
        raise NotImplementedError()

    @staticmethod
    def get_hit():
        raise NotImplementedError()

# reference code below, from a notebook:

# create the hits
# for incident in super_incidents:
#     print("making hits for:", incident)
#     for idx, image_paths in enumerate(image_path_chunks):
#         hit_data = {}
#         hit_data["class"] = incident
#         hit_data["definition"] = \
#             " --OR, another definition:-- ".join(MDD["disaster_definitions"][x] for x in label_mapping[incident])
# #         print(hit_data["definition"])
# #         print()
# #         break
        
#         def add_ending(l):
#             return ["twitter_images/" + x for x in image_paths]

#         hit_data["images_to_label"] = add_ending(image_paths)
#         hit_data["ground_truth_images"] = {"true": [], "false": []}
#         hit_data["positive_examples"] = []
#         hit_data["negative_examples"] = []
        
#         # examples
#         for x in label_mapping[incident]:
#             hit_data["positive_examples"] += MDD["disaster_examples"]["positives"][x]
#             hit_data["negative_examples"] += MDD["disaster_examples"]["negatives"][x]
#         random.shuffle(hit_data["positive_examples"])
#         random.shuffle(hit_data["negative_examples"])
        
#         # GT quality control
#         for _ in range(NUM_GT_TRUE):
#             x = random.choice(label_mapping[incident])
#             hit_data["ground_truth_images"]["true"] += [random.choice(MDD["disaster_ground_truth"]["positives"][x])]
#         random.shuffle(hit_data["ground_truth_images"]["true"])
#         for _ in range(NUM_GT_FALSE):
#             x = random.choice(label_mapping[incident])
#             hit_data["ground_truth_images"]["false"] += [random.choice(MDD["disaster_ground_truth"]["negatives"][x])]
#         random.shuffle(hit_data["ground_truth_images"]["false"])
        
#         # a hack to remove the outdated url
#         STR_TO_REMOVE = "https://wednesday.csail.mit.edu/ethan/"
#         def str_rem(l):
#             nl = [x[len(STR_TO_REMOVE):] for x in l]
#             return nl
#         hit_data["positive_examples"] = str_rem(hit_data["positive_examples"])
#         hit_data["negative_examples"] = str_rem(hit_data["negative_examples"])
#         hit_data["ground_truth_images"]["true"] = str_rem(hit_data["ground_truth_images"]["true"])
#         hit_data["ground_truth_images"]["false"] = str_rem(hit_data["ground_truth_images"]["false"])
        
#         # Save to a file.
#         filename = "{}_{:03d}.json".format(incident.replace(" ", "_"), idx)
#         filename = os.path.join(HIT_DIRECTORY, filename)
#         goat.write_to_json(filename, hit_data)