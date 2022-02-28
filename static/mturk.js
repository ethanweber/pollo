// some global variables
var GLOBAL_IMAGE_WIDTH = null;


var GLOBAL_IMAGE_MAX_WIDTH = 500;
var GLOBAL_CONFIG = null;


// lists to keep track of the ids, to toggle visibility
// keep track of responses as you go, so we can compute results at the end

var GLOBAL_KEYPRESS_BUFFER = "aaaa";

// keep track of the responses in the examples
var GLOBAL_EXAMPLE_RESPONSES = null;

// concatenation of both gt and place queries
var GLOBAL_ALL_EXAMPLES = null;
var GLOBAL_ALL_IDS = null;
var GLOBAL_ALL_INDICES = null;
var GLOBAL_ALL_RESPONSES = null;
var GLOBAL_ALL_CURRENT_IDX = 0;

var GLOBAL_FIRST_TIME = true;

var GLOBAL_CURRENT_PAGE = null; // keep track of which page we are on

// TIMES
var GLOBAL_START_REAL_TEST = null;
var GLOBAL_END_REAL_TEST = null;

var ASSIGNMENT_ID = null;
var HIT_ID = null;
var TURK_SUBMIT_TO = null;
var WORKER_ID = null;


function turkGetParam(name) {
    var regexS = "[\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    // console.log(tmpURL);
    var results = regex.exec(tmpURL);
    if (results == null) {
        return "";
    } else {
        return results[1];
    }
}


// entrypoint for the site, which is the instructions.
$(document).ready(function() {

    // mturk parameters
    // https://github.com/jspsych/jsPsych/issues/10
    // https://gist.github.com/longouyang/845528/0cfe4a527d551b948392976f0539723b257b7c67

    var param = function(url, name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return (results == null) ? "" : results[1];
    }

    var src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;

    ASSIGNMENT_ID = unescape(param(src, "assignmentId"));
    HIT_ID = unescape(param(src, "hitId"));
    TURK_SUBMIT_TO = unescape(param(src, "turkSubmitTo"));
    WORKER_ID = unescape(param(src, "workerId"));

    console.log(TURK_SUBMIT_TO);

    goToPage("Instructions");
    setupAllPages();
});

// setup all the pages
async function setupAllPages() {
    document.getElementById("proceedButton").disabled = true;
    document.getElementById("GoToAnnotationTestButton").disabled = true;
    document.getElementById("IntructionsContent").classList.add("loader");
    let config_type = GLOBAL_CONFIG_TYPE;
    let config_name = GLOBAL_CONFIG_NAME;

    GLOBAL_CONFIG = await getConfigFromConfigTypeAndConfigName(config_type, config_name);

    document.getElementById("IntructionsContent").classList.remove("loader");
    document.getElementById("proceedButton").disabled = true;
    initializeArrays();
    console.log(GLOBAL_CONFIG);
    setupContent();
}

function initializeArrays() {
    // flip the GT_HIDDEN_EXAMPLES as well and add to the query list
    let GT_HIDDEN_EXAMPLES_COPY = JSON.parse(JSON.stringify(GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"]));
    // for (let i = 0; i < GT_HIDDEN_EXAMPLES_COPY.length; i++) {
    //     GT_HIDDEN_EXAMPLES_COPY[i].urls.reverse()
    // }
    // NOTE(ethan): not actually reversing right now...to avoid any mistakes...
    // [gt query examples, qt query examples reversed, query examples]
    GLOBAL_ALL_EXAMPLES = GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"].concat(GT_HIDDEN_EXAMPLES_COPY).concat(GLOBAL_CONFIG["QUERY_EXAMPLES"]);
    GLOBAL_ALL_IDS = Array(GLOBAL_ALL_EXAMPLES.length).fill(null);
    GLOBAL_ALL_INDICES = Array(GLOBAL_ALL_EXAMPLES.length).fill(null);
    GLOBAL_ALL_RESPONSES = Array(GLOBAL_ALL_EXAMPLES.length).fill(null);
    GLOBAL_EXAMPLE_RESPONSES = Array(GLOBAL_CONFIG["EXAMPLES"].length).fill(false);
}

function hideAllPages() {
    document.getElementById('Instructions').style.display = 'none';
    document.getElementById('AnnotationTestStart').style.display = 'none';
    document.getElementById('AnnotationTest').style.display = 'none';
    document.getElementById('Finish').style.display = 'none';
}

function goToPage(name) {
    hideAllPages();
    document.getElementById(name).style.display = 'block';
    GLOBAL_CURRENT_PAGE = name;
    $(window).scrollTop(0); // scroll to top

    // handle time keeping
    if (name == "AnnotationTest") {
        // start of annotation test
        GLOBAL_START_REAL_TEST = (Date.now() / 1000);
    } else if (name == "Finish") {
        // end of annotation test
        GLOBAL_END_REAL_TEST = (Date.now() / 1000);
    }
}

function setupContent() {
    picknSetContent();
}

function attemptSubmit() {
    picknAttemptSubmit();
}

var down = false;
document.onkeydown = function(e) {
    if (down) return;
    down = true;
    let keycode = e.keyCode;
    let character = String.fromCharCode(keycode);
    GLOBAL_KEYPRESS_BUFFER += character;
    GLOBAL_KEYPRESS_BUFFER = GLOBAL_KEYPRESS_BUFFER.substring(1, 5);

    // shortcuts
    if (GLOBAL_KEYPRESS_BUFFER == "OIOI") {
        goToPage("AnnotationTestStart");
    }
};

// don't allow user to hold down key
document.addEventListener('keyup', function() {
    down = false;
}, false);

// handle left clicking on the screen
document.addEventListener("mouseup", (e) => {
    picknLeftClickControls(e);
})