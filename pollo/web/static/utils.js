// utilities for drawing polygons, editing, hitting the server, etc.

// Get the config for a HIT.
async function getConfigFromConfigTypeAndConfigName(config_type, config_name) {
    return new Promise(function(resolve, reject) {
        console.log(config_name);
        let endpoint = "/hits" +
            "/" + config_name;
        $.get(endpoint,
            function(data, textStatus, jqXHR) {
                resolve(data);
            });
    });
}

// Get the config for a HIT.
async function getResultsFromConfigTypeAndConfigName(config_type, config_name) {
    return new Promise(function(resolve, reject) {
        console.log(config_name);
        let endpoint = "/local_responses" +
            "/" + config_name;
        $.get(endpoint,
            function(data, textStatus, jqXHR) {
                resolve(data);
            });
    });
}

// Helper function to convert HTML string to DOM node
function createNodeFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; // Return the node
}

// Returns the HTML for the example.
async function getExampleTemplate(example) {
    return new Promise(function(resolve, reject) {
        let endpoint = "/example_template";
        $.ajax({
            type: 'POST',
            url: endpoint,
            data: JSON.stringify(example),
            contentType: 'application/json',
            success: function(data, textStatus, jqXHR) {
                let node = createNodeFromHTML(data);
                resolve(node);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            }
        });
    });
}

// Get a random subarray of a list.
// https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubarray(arr, size) {
    let shuffled = arr.slice(0),
        i = arr.length,
        temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

function getHTMLCopyOfElementID(element_id) {
    let tempdiv = document.createElement("div");
    tempdiv.appendChild(document.getElementById(element_id));
    return tempdiv;
}

function deleteAllElementsOfTagName(tagName) {
    let htmlCollection = document.getElementsByTagName(tagName);
    let arr = Array.from(htmlCollection);
    arr.map(el => el.parentNode.removeChild(el));
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// https://www.jacklmoore.com/notes/rounding-in-javascript/
function getRoundedNumber(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}