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
        let endpoint = "/get_responses" +
            "/" + config_name;
        $.get(endpoint,
            function(data, textStatus, jqXHR) {
                resolve(data);
            });
    });
}

// Return the HTML with the nicely formatted, zoomed in, annotation. Polygons on top. :)
function getImageWithBox(image_url, bbox) {

    let container = document.createElement('div');
    container.setAttribute("class", "img-overlay-wrap");
    let image = document.createElement('img');
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.appendChild(image);
    container.appendChild(svg);

    // set the image url
    image.src = image_url;

    image.height = GLOBAL_IMAGE_HEIGHT;

    if (bbox !== null) {
        // pull out the bounding box data
        let x = bbox[0];
        let y = bbox[1];
        let width = bbox[2];
        let height = bbox[3];
        let image_width = bbox[4];
        let image_height = bbox[5];

        let y_scalar = GLOBAL_IMAGE_HEIGHT / image_height;
        let x_scalar = y_scalar;
        // let y_scalar = 1.0;
        // let x_scalar = 1.0;

        // draw the box
        let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        svg.appendChild(polygon);
        let tl = svg.createSVGPoint();
        tl.x = x * x_scalar;
        tl.y = y * y_scalar;
        polygon.points.appendItem(tl);
        let tr = svg.createSVGPoint();
        tr.x = (x + width) * x_scalar;
        tr.y = (y) * y_scalar;
        polygon.points.appendItem(tr);
        let br = svg.createSVGPoint();
        br.x = (x + width) * x_scalar;
        br.y = (y + height) * y_scalar;
        polygon.points.appendItem(br);
        let bl = svg.createSVGPoint();
        bl.x = x * x_scalar;
        bl.y = (y + height) * y_scalar;
        polygon.points.appendItem(bl);
    }


    let outercontainer = document.createElement('div');
    outercontainer.appendChild(container);
    return outercontainer;
}

// Return the HTML with the nicely formatted, zoomed in, annotation. Polygons on top. :)
function getVideo(image_url) {
    let container = document.createElement('div');
    container.setAttribute("class", "img-overlay-wrap");
    container.setAttribute("width", "100%");
    let video = document.createElement('video');
    video.height = GLOBAL_IMAGE_HEIGHT;
    video.src = image_url;
    video.setAttribute("controls", "controls");
    video.setAttribute("preload", "metadata");
    // video.setAttribute("preload", "none");
    video.setAttribute("width", "100%");
    container.appendChild(video);
    return container;
}

// Get the pickn annotation as a div.
function getPicknAnnotationAsDiv(example) {

    let annotationHTML = document.createElement('div');
    // annotationHTML.setAttribute("class", "PickNRow");

    let images_and_boxes = example.images_and_boxes;

    let shotchangeRow = document.createElement('div');
    shotchangeRow.setAttribute("class", "PickNRow");
    for (let i = 0; i < images_and_boxes.length; i++) {
        let image_url = images_and_boxes[i][0];
        let bbox = images_and_boxes[i][1]; // which might be null
        let imagehtml = getImageWithBox(image_url, bbox);
        shotchangeRow.appendChild(imagehtml);
    }
    annotationHTML.appendChild(shotchangeRow);

    let possibleChoicesRow = document.createElement('div');
    possibleChoicesRow.setAttribute("class", "PickNRow");
    let choices = example.choices;
    for (let j = 0; j < choices.length; j++) {
        let rowItem = document.createElement('div');
        rowItem.setAttribute("class", "PickNRowItem");
        let choice = choices[j];
        rowItem.innerHTML = getVideo(choice).innerHTML;
        rowItem.innerHTML += "<button style=\"width: 25%\" type=\"button\">" + j.toString() + "</button>"
        let width_perc = Math.floor((1.0 / choices.length) * 100.0);
        rowItem.setAttribute("width", width_perc.toString() + "%");
        possibleChoicesRow.appendChild(rowItem);
    }
    annotationHTML.appendChild(possibleChoicesRow);

    return annotationHTML
}

// Get the pickn annotation as a div.
function getBiasganAnnotationAsDiv(example) {
    let annotationHTML = document.createElement('div');
    annotationHTML.setAttribute("class", "PickNRow");
    let urls = example.urls;
    let shotchangeRow = document.createElement('div');
    shotchangeRow.setAttribute("class", "PickNRow");
    for (let i = 0; i < urls.length; i++) {
        let image_url = urls[i];
        let imagehtml = getImageWithBox(image_url, null);
        shotchangeRow.appendChild(imagehtml);
    }
    annotationHTML.appendChild(shotchangeRow);
    let possibleChoicesRow = document.createElement('div');
    possibleChoicesRow.setAttribute("class", "PickNRow");
    let choices = example.choices;
    for (let j = 0; j < choices.length; j++) {
        let rowItem = document.createElement('div');
        rowItem.setAttribute("class", "PickNRowItem");
        let choice = choices[j];
        rowItem.innerHTML += "<button type=\"button\">" + choice + "</button>"
        let width_perc = Math.floor((1.0 / choices.length) * 100.0);
        rowItem.setAttribute("width", width_perc.toString() + "%");
        possibleChoicesRow.appendChild(rowItem);
    }
    annotationHTML.appendChild(possibleChoicesRow);
    return annotationHTML
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