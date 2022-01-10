# Amazon MTurk User Study


### Use cases (implemented)

- [x] Qualitative user studies
- [ ] Binary classification
- [ ] 

### Folder structure

```
|-pages/
    |-mturk.html
    |-responses.html
|-static/
    |-data/
        |-hits/
            |-<hit_name>.json
        |-responses/
            |-<hit_name>.json
        |-media/
            |-

|-hit_maker.py
|-requester.ipynb
    # main file for creating hits, sending hits, and saving hits

|-requester.py
|-server.py

|-mturk_creds.json
|-mturk_database.pkl
```

### Install dependencies

```
# install dependencies
pip install -r requirements.txt

# install goat
git clone git@github.com:ethanweber/goat.git
cd goat
python setup.py
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

```
# add needed publically accessible files to static/ folder

# start the server
python server.py

# add HTTPS to your server for access to answer
# TODO(ethan): document how to do this
https://docs.google.com/document/d/1kGumBejzK7UO2rvDBnPU9UvTUAftie0X-mydV-9BCtI/edit


# go to the url
https://myurl.mydomain/mturk/<hit_name>

# or, after the responses are in from mturk
https://myurl.mydomain/responses/<hit_name>

```
