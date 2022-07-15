from typing import List
import setuptools
import os


def get_list_of_requirements(requirements_filename: str) -> List[str]:
    """
    Returns a list of requirements from a requirements file.
    """
    install_requires = []
    if os.path.isfile(requirements_filename):
        with open(requirements_filename) as f:
            install_requires = f.read().splitlines()
    install_requires_n = []
    for x in install_requires:
        if x != "" and x[0] != "#":
            install_requires_n.append(x)
    install_requires = install_requires_n
    return install_requires


install_requires = get_list_of_requirements("requirements.txt")

setuptools.setup(
    name="anno",
    version="1.2.3",
    author="Ethan Weber",
    author_email="ethanweber@berkeley.edu",
    description="A repo for qualitative user studies using Amazon Mechanical Turk (AMT).",
    url="https://github.com/ethanweber/anno",
    packages=setuptools.find_packages(),
    test_suite="goat",
    python_requires=">=3.6",
    install_requires=install_requires,
)
