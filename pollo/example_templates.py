"""
This module contains the example templates for the pollo app.
"""


class ImageExampleTemplate:
    name: str = "ImageExampleTemplate"

    def get_div(self, data):
        html_str = ""
        html_str = """<div>"""
        html_str += """<div class="PickNRow">"""
        for i, choice in enumerate(data["choices"]):
            html_str += f"""<div class="PickNRowItem" width="25%">"""
            html_str += f"""<div class="img-overlay-wrap" width="100%">"""
            html_str += f"""<img height=300 src="{choice}">"""
            html_str += """</div>"""
            html_str += f"""<button style="width: 25%" type="button"> {i} </button>"""
            html_str += "</div>"
        html_str += """</div>"""
        html_str += """</div>"""
        return html_str


class VideoExampleTemplate:
    name: str = "VideoExampleTemplate"

    def get_div(self, data):
        html_str = ""
        html_str = """<div>"""
        html_str += """<div class="PickNRow">"""
        for i, choice in enumerate(data["choices"]):
            html_str += f"""<div class="PickNRowItem" width="25%">"""
            html_str += f"""<div class="img-overlay-wrap" width="100%">"""
            html_str += f"""<video height=300 src="{choice}" controls="controls" preload="metadata" width="100%">"""
            html_str += """</div>"""
            html_str += f"""<button style="width: 25%" type="button"> {i} </button>"""
            html_str += "</div>"
        html_str += """</div>"""
        html_str += """</div>"""
        return html_str


def get_template_instance(template_name):
    templates = {
        "ImageExampleTemplate": ImageExampleTemplate,
        "VideoExampleTemplate": VideoExampleTemplate,
    }
    return templates.get(template_name, None)()
