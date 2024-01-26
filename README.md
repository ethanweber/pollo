# Pollo: a tool for crowd-sourced poll-ing

> This repo is a compilation of code for AMT annotation tasks for computer vision purposes (e.g., qualitative user studies). I'll try to update this more comprehensively over time for others to benefit from. Contact `ethanweber@berkeley.edu` if you have questions.

The main idea for this repo is to specify a JSON file descripting each HIT (Human Intelligence Task) which will then dynamically populate a website (via JavaScript) with the task.

### Folder structure

```
|-pages/
    |-hits.html
    |-responses.html
|-static/
    |-data/
        |-hits/
            |-<hit_name>.json
        |-responses/
            |-<hit_name>.json
        |-media/ # here you can store images or videos
|-pollo/hit_makers/
    |-hit_maker.py
    |-biasgan_hit_maker.py

|-requester.ipynb # main file for creating hits, sending hits, and saving hits

|-requester.py
|-server.py

|-mturk_creds.json
|-mturk_database.pkl
```

### Getting started

Install the repo as a Python package. This will also install the dependencies.

```bash
pip install -e .
```

### Setup data

First, you need to add data to the `static/data/` folder, as specified above.

For media, this might be a symbolic link.

```
cd static/data/media
ln -l /path/to/images images
```

When referencing an asset in the static folder, e.g., an image, you can use the `path` that starts after "static".
E.g., "data/media/images/<>"

Note:
pages/img_classify.html and static/img_classify/ aren't very well integrated into the MTURK pipeline yet.

### Server configuration

Go to [REVERSE_PROXY.md](REVERSE_PROXY.md) for details!

# go to the url
https://myurl.mydomain/interface/<hit_name>

# or, after the responses are in from mturk
https://myurl.mydomain/responses/<hit_name>

### MTurk credentials

Setup MTurk credentials. Create a file named "mturk_creds.json" and place it in the root directory of this repo. It should have the following content.

```json
{
    "aws_access_key_id": "<aws_access_key_id>",
    "aws_secret_access_key": "<aws_secret_access_key>"
}
```

### Projects that used this code

Here are some projects that have used this code (or versions of it). The code presented in this repo is a general implementation for qualitative user studies. However, it was and can be modified for more specific use cases.

- [Studying Bias in GANs through the Lens of Race (BiasGAN)](https://neerja.me/bias-gans/)
    - In this paper, there were three tasks for comparing images.
- [Sitcoms3D](https://ethanweber.me/sitcoms3D/) - In this paper, the task was a qualitative user study comparing two videos against one another. The user was instructed to select which video looked more realistic.
- [Learning2Listen](https://evonneng.github.io/learning2listen/)
