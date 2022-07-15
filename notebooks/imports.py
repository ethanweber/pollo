import os
import numpy as np
import random
import mediapy as media
import pprint
import pandas as pd
from tqdm import tqdm


def setup_ipynb():
    """
    https://stackoverflow.com/questions/15411967/how-can-i-check-if-code-is-executed-in-the-ipython-notebook
    https://stackoverflow.com/questions/35595766/matplotlib-line-magic-causes-syntaxerror-in-python-script
    This gets reference to the InteractiveShell instance
    """
    try:
        from IPython import get_ipython
        get_ipython().run_line_magic('load_ext', 'autoreload')
        get_ipython().run_line_magic('autoreload', '2')
        get_ipython().run_line_magic('matplotlib', 'inline')
        return True
    except:
        return False


setup_ipynb()

if __name__ == '__main__':
    exit(0)
