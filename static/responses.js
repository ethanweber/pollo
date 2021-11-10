// some global variables
var GLOBAL_IMAGE_HEIGHT = 200;
var GLOBAL_IMAGE_WIDTH = null;
var GLOBAL_IMAGE_MAX_WIDTH = null;
var GLOBAL_RESPONSES = null;

var GLOBAL_CLASS_IDX = null

var GLOBAL_CONFIG = null;
var GLOBAL_PICKN_CHOICES = null;


// entrypoint for the site, which is the instructions.
$(document).ready(function () {
    setupStuff();
});

// Get the items for any given page.
async function picknGetImagesFromAnnotationsFromChoices(example, choices) {
    let examples = [];
    for (let i = 0; i < example.length; i++) {
        examples.push(getPicknAnnotationAsDiv(example[i]));
    }
    return await Promise.all(examples);
}

// setup all the pages
async function setupStuff() {
    GLOBAL_RESPONSES = await getResultsFromConfigTypeAndConfigName(GLOBAL_CONFIG_TYPE, GLOBAL_CONFIG_NAME);
    let config_type = GLOBAL_CONFIG_TYPE;
    let config_name = GLOBAL_CONFIG_NAME;
    GLOBAL_CONFIG = await getConfigFromConfigTypeAndConfigName(config_type, config_name);

    console.log(GLOBAL_CONFIG);
    console.log(GLOBAL_RESPONSES);

    document.getElementById("testtime").innerHTML = "GLOBAL_REAL_TEST_TIME: " + GLOBAL_RESPONSES["GLOBAL_REAL_TEST_TIME"].toString();


    // draw the hit result here
    let examples = await picknGetImagesFromAnnotationsFromChoices(GLOBAL_CONFIG["QUERY_EXAMPLES"], GLOBAL_RESPONSES["QUERY_EXAMPLES_RESPONSES"]);
    for (let i = 0; i < examples.length; i++) {

        examples[i].children[1].children[GLOBAL_RESPONSES["QUERY_EXAMPLES_RESPONSES"][i]].style.border = "10px solid green";

        let example = document.getElementById("ExampleTemplate");
        example.getElementsByClassName("ExampleTemplateClass1")[0].innerHTML = "Example " + (i + 1).toString();
        example.getElementsByClassName("ExampleTemplateContent1")[0].innerHTML = "";
        example.getElementsByClassName("ExampleTemplateContent1")[0].appendChild(examples[i]);
        // description will come later, when someone clicks
        var new_div = document.createElement("div");
        new_div.innerHTML = example.innerHTML;
        new_div.setAttribute("index", i);

        document.getElementById("pickn_results").appendChild(examples[i]);
    }
}