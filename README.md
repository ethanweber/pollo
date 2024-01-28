# 🐥 Pollo: a tool for crowd-sourced polling

This repo is for AMT annotation tasks for computer vision purposes (e.g., qualitative user studies). The main idea for this repo is to specify a JSON file describing each HIT (Human Intelligence Task) which will then dynamically populate a website (via JavaScript) with the task. A notebook lets you create and manage your HITs.

# Getting started

Install the repo as a package

```bash
pip install pollo
```

If you want the latest version, you can clone and install in editable mode.

```bash
git clone https://github.com/ethanweber/pollo.git
cd pollo
pip install -e .
```

# Your first project

The quickest way to understand this code it to look at our example. Here are the steps!

1. Start the server.

    ```bash
    cd example_project
    python -m pollo.server
    ```

2. Open the [examples/image_project/requester.ipynb](examples/image_project/requester.ipynb) file and step through it.

# Folder structure

Here is what a project folder structure looks like.

```
example-project/
├── data/
│   ├── hits/
│   │   └── <hit_name>.json          # HIT (Human Intelligence Task) data
│   ├── responses/
│   │   └── <hit_name>.json          # Responses to HITs
│   ├── local_responses/
│   │   └── <hit_name>.json          # Local responses to HITs
│   └── media/                       # Media assets like images or videos
│       ├── images/
│       └── videos/
├── requester.ipynb                  # Main notebook for HITs management
├── mturk_creds.json                 # AWS Mechanical Turk credentials
└── mturk_database.pkl               # Database for tracking HITs
```

Place MTurk credentials in a file named "mturk_creds.json". It should have the following content.

```json
{
    "aws_access_key_id": "<aws_access_key_id>",
    "aws_secret_access_key": "<aws_secret_access_key>"
}
```

# Server details

You need to host your server with an HTTPS domain to be compatible with AMT. Go to [REVERSE_PROXY.md](REVERSE_PROXY.md) for details on how to set this up. After this, you should be able to navigate to the following URLs.

```bash
# an interface to ask the hit questions
https://myurl.mydomain/hits-interface/<hit_name>

# an interface showing the responses to a hit
https://myurl.mydomain/responses-interface/<hit_name>

# an interface showing the local responses to a hit
https://myurl.mydomain/local_responses-interface/<hit_name>

# a file tree
https://myurl.mydomain/media/
```

# Projects that used our code

Here are some projects that have used this code (or versions of it). The code presented in this repo is a general implementation for qualitative user studies. However, it was and can be modified for more specific use cases.

- [Scaling up instance annotation via label propagation](http://scaling-anno.csail.mit.edu/), ICCV 2021
- [Learning2Listen](https://evonneng.github.io/learning2listen/), CVPR 2022
- [Studying Bias in GANs through the Lens of Race (BiasGAN)](https://neerja.me/bias-gans/), ECCV 2022
- [Sitcoms3D](https://ethanweber.me/sitcoms3D/), ECCV 2022
