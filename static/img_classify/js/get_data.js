var maxNumExample = 25;
var currentIndex = -5;
var timerHandle;
var keyIsDown = false;
var testCount = 0;
var correctCount = 0;
var eventScript = '';
var respOpen = [];
var workerId;
var assignmentId;
var hitId;
var gameId;

// Create the XHR object.
function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
	return text.match('<title>(.*)?</title>')[1];
}

// This function will read a JSON file and parse it.
// https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
function readJSONFile(url, callback) {
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		alert('CORS not supported');
		return;
	}

	// Response handlers.
	xhr.onload = function () {
		var text = xhr.responseText;
		callback(text);
	};

	xhr.onerror = function () {
		alert('Woops, there was an error making the request.');
	};

	xhr.send();
}

function loadData() {
	for (var i = -4; i < 0; i++) {
		$('#contentDiv').append('<div style="display: none;" id="holderDiv' + i + '"></div>');
	}
	for (var i = 0; i < data.length; i++) {
		$('#contentDiv').append('<div style="display: none;" id="holderDiv' + i + '"><p>No</p><p>Yes</p></div>');
	}
	for (var i = data.length; i < data.length + 4; i++) {
		$('#contentDiv').append('<div style="display: none;" id="holderDiv' + i + '"></div>');
	}
	for (var i = 0; i < data.length; i++) {
		$('#holderDiv' + i).append('<img id="holderImage' + i + '" src=""/>');
		$('#holderImage' + i).load(imageLoaded(i));
		$('#holderImage' + i).attr('src', data[i].images);
	}
	currentIndex = 0;
	imageCount = data.length;
	updateSubmitButton();
	displayFrame(0);
}

function getTodoCnt() {
	var todoCnt = 0;
	for (var i = 0; i < data.length; i++) {
		if (!($('#holderDiv' + i).hasClass('target') || $('#holderDiv' + i).hasClass('noise'))) {
			++todoCnt;
		}
	}
	return todoCnt;
}

function updateSubmitButton() {
	if (assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
		document.getElementById('submitButton').disabled = 'disabled';
		document.getElementById('submitButton').value = 'You must ACCEPT the HIT before you can submit the results.';
	} else {
		var todoCnt = getTodoCnt();
		if (todoCnt == 0) {
			document.getElementById('submitButton').disabled = '';
			document.getElementById('submitButton').value = 'Submit';
		} else {
			document.getElementById('submitButton').disabled = 'disabled';
			document.getElementById('submitButton').value = 'Submit (' + todoCnt + ' images left)';
		}
	}
}

function confirmSubmit() {
	eventScript = eventScript + currentTime() + 'sm;';

	var resultString = '';
	var urlString = '';
	for (var i = 0; i < data.length; i++) {
		if ($('#holderDiv' + i).hasClass('target')) {
			resultString += '1';
		} else {
			resultString += '0';
		}

		urlString += data[i]["images"] + ';';
	}
	var full_answer = {};
    // save the config name and the entire config file
	full_answer["GLOBAL_CONFIG_NAME"] = GLOBAL_CONFIG_NAME;
    full_answer["GLOBAL_CONFIG"] = GLOBAL_CONFIG;
	full_answer["RESPONSE"] = GLOBAL_CONFIG_NAME + '-' + resultString + '-' + urlString;
	full_answer = JSON.stringify(full_answer);


	// console.log(answer);
	$('#answer').val(full_answer);
	$('#assignment').val(assignmentId);
	$('#owner').val(gup('owner'));
	// Calculate the accuracy.
	var correctNegCount = 0;
	var correctPosCount = 0;
	var posTestCount = 0;
	var negTestCount = 0;
	for (var i = 0; i < data.length; i++) {
		if ('truth' in data[i]) {
			var answer = $('#holderDiv' + i).hasClass('target');
			if (data[i].truth) {
				posTestCount++;
				if (answer == data[i].truth) {
					correctPosCount++;
				}
			} else {
				negTestCount++;
				if (answer == data[i].truth) {
					correctNegCount++;
				}
			}
		}
	}
	correctCount = correctPosCount + correctNegCount;
	testCount = posTestCount + negTestCount;
	var percentCorrect = correctCount / testCount;
	// TODO: include accuracy in the final results for MTurk
	var pass = (percentCorrect >= 0.80);
	if (pass) {
		$('#event').val(eventScript);
		document.getElementById("submitid").submit();
		return true;
	} else {
		eventScript = eventScript + currentTime() + 'rj;';
		alert("Your accuracy is too low! You are not allowed to submit. Click [Ok] and refine the results.");
		return false;
	}
}

function leftButtonFun() {
	currentIndex = 0;
	displayFrame(currentIndex);
	eventScript = eventScript + currentTime() + 'be;';
}

function rightButtonFun() {
	currentIndex = data.length - 1;
	displayFrame(currentIndex);
	eventScript = eventScript + currentTime() + 'en;';
	updateSubmitButton();
}

function answerHit() {
	if ($('#holderDiv' + currentIndex).hasClass('target')) {
		$('#holderDiv' + currentIndex).removeClass('target');
		$('#holderDiv' + currentIndex).addClass('noise');
	} else {
		$('#holderDiv' + currentIndex).addClass('target');
		$('#holderDiv' + currentIndex).removeClass('noise');
	}
}

function currentTime() {
	var d = new Date();
	return d.getTime();
}

// var hit_name = gup('hitName');
// var turkSubmitTo = gup('turkSubmitTo');

var param = function (url, name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	return (results == null) ? "" : results[1];
}
var src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;
turkSubmitTo = unescape(param(src, "turkSubmitTo"));
console.log(turkSubmitTo);

// For shuffling the list of images.
function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

// TODO: better set this.
var data;
var disaster_or_place;
var definition;
var positive_examples;
var negative_examples;


function media_str(x) {
	return "/static/data/media/" + x;
}

//usage:
// TODO: need to change this hard coded path
console.log(GLOBAL_CONFIG_NAME);
readJSONFile("/static/data/hits/" + GLOBAL_CONFIG_NAME + ".json", function (text) {

	GLOBAL_CONFIG = JSON.parse(text);

	// Set the values.
	data = [];
	for (var i = 0; i < GLOBAL_CONFIG["images_to_label"].length; ++i) {
		data.push({ "images": media_str(GLOBAL_CONFIG["images_to_label"][i]) })
	}
	// Set ground truth values.
	for (var i = 0; i < GLOBAL_CONFIG["ground_truth_images"]["true"].length; ++i) {
		data.push({ "images": media_str(GLOBAL_CONFIG["ground_truth_images"]["true"][i]), "truth": true })
	}
	for (var i = 0; i < GLOBAL_CONFIG["ground_truth_images"]["false"].length; ++i) {
		data.push({ "images": media_str(GLOBAL_CONFIG["ground_truth_images"]["false"][i]), "truth": false })
	}
	// Shuffle the array.
	data = shuffle(data);
	// Set other values.
	disaster_or_place = GLOBAL_CONFIG["class"];
	definition = GLOBAL_CONFIG["definition"];

	positive_examples = [];
	for (var i = 0; i < GLOBAL_CONFIG["positive_examples"].length; ++i) {
		positive_examples.push({ "images": media_str(GLOBAL_CONFIG["positive_examples"][i]) });
	}
	negative_examples = [];
	for (var i = 0; i < GLOBAL_CONFIG["negative_examples"].length; ++i) {
		negative_examples.push({ "images": media_str(GLOBAL_CONFIG["negative_examples"][i]) });
	}
	startpage();
});


function displayFrame(n) {
	for (var i = -4; i < data.length + 4; ++i) {
		$('#holderDiv' + i).hide();
		$('#holderDiv' + i).removeClass('focus3');
		$('#holderDiv' + i).removeClass('focus2');
		$('#holderDiv' + i).removeClass('focus1');
		$('#holderDiv' + i).removeClass('focus');
	}

	$('#holderDiv' + (n - 4)).hide();
	$('#holderDiv' + (n - 3)).show();	//	$('#holderDiv'+(n-3)).width(25);	$('#holderDiv'+(n-3)).height(25);
	$('#holderDiv' + (n - 2)).show();	//	$('#holderDiv'+(n-2)).width(50);	$('#holderDiv'+(n-2)).height(50);
	$('#holderDiv' + (n - 1)).show();	//	$('#holderDiv'+(n-1)).width(100);	$('#holderDiv'+(n-1)).height(100);
	$('#holderDiv' + n).show();	//	$('#holderDiv'+n    ).width(400);	$('#holderDiv'+n    ).height(400);
	$('#holderDiv' + (n + 1)).show();	//	$('#holderDiv'+(n+1)).width(100);	$('#holderDiv'+(n+1)).height(100);
	$('#holderDiv' + (n + 2)).show();	//	$('#holderDiv'+(n+2)).width(50);	$('#holderDiv'+(n+2)).height(50);
	$('#holderDiv' + (n + 3)).show();	//	$('#holderDiv'+(n+3)).width(25);	$('#holderDiv'+(n+3)).height(25);
	$('#holderDiv' + (n + 4)).hide();

	$('#holderDiv' + (n - 3)).addClass('focus3'); $('#holderDiv' + (n - 3)).removeClass('focus2');
	$('#holderDiv' + (n - 2)).addClass('focus2'); $('#holderDiv' + (n - 2)).removeClass('focus1'); $('#holderDiv' + (n - 2)).removeClass('focus3');
	$('#holderDiv' + (n - 1)).addClass('focus1'); $('#holderDiv' + (n - 1)).removeClass('focus'); $('#holderDiv' + (n - 1)).removeClass('focus2');
	$('#holderDiv' + n).addClass('focus'); $('#holderDiv' + n).removeClass('focus1');
	$('#holderDiv' + (n + 1)).addClass('focus1'); $('#holderDiv' + (n + 1)).removeClass('focus'); $('#holderDiv' + (n + 1)).removeClass('focus2');
	$('#holderDiv' + (n + 2)).addClass('focus2'); $('#holderDiv' + (n + 2)).removeClass('focus1'); $('#holderDiv' + (n + 2)).removeClass('focus3');
	$('#holderDiv' + (n + 3)).addClass('focus3'); $('#holderDiv' + (n + 3)).removeClass('focus2');

	if (!($('#holderDiv' + n).hasClass('target') || $('#holderDiv' + n).hasClass('noise'))) {
		$('#holderDiv' + n).addClass('noise');
	}

	$('#progressCNT').html((n + 1) + '/' + data.length);
}



var hasFocus = false;
var instructionPage = true;

function start() {
	hasFocus = true;
	//$('#startButton').hide();
	if (instructionPage) {
		instructionPage = false;
		$('#startButton').html('Instructions');
		$('#submitButton').show();
		$('#progressDiv').show();
		checkDisplay();
		eventScript = eventScript + currentTime() + 'wk;';
	} else {
		instructionPage = true;
		$('#startButton').html('Back to work');
		$('#submitButton').hide();
		$('#progressDiv').hide();
		$('#instrDiv').show();
		$('#contentDiv').hide();
		eventScript = eventScript + currentTime() + 'in;';
	}
}

var loadedCount = 0;

function imageLoaded(n) {
	loadedCount = loadedCount + 1;
	checkDisplay();
	eventScript = eventScript + currentTime() + 'ld' + n + ';';
}

function checkDisplay() {
	if (!hasFocus) {
		$('#instrDiv').show();
		$('#loadingDiv').hide();
		$('#contentDiv').hide();
	}
	if (hasFocus) {
		$('#instrDiv').hide();
		$('#loadingDiv').hide();
		$('#contentDiv').show();
	}
}

function gup(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null)
		return "NO_VAL";
	else
		return results[1];
}

function startpage() {
	$('#question').text(disaster_or_place);
	if (definition != '') {
		$('#definitionDiv').html('<p><b>Disaster</b>: ' + disaster_or_place + '<br><b>Definition</b>: ' + definition + '</p>');
	}
	var exampleStr = ''; 7
	exampleStr = exampleStr + '<div class="noise example"><p>No Drawing</p><p>Yes</p><br><img src="https://3dvision.princeton.edu/pvt/TurkCleaner/instruction/office_cubicles_594262350a90f73e693d32f99cc2c01f.jpg"></div>';
	exampleStr = exampleStr + '<div class="noise example"><p>No Screenshot</p><p>Yes</p><br><img src="https://3dvision.princeton.edu/pvt/TurkCleaner/instruction/cybercafe_c443a65367506809a852d29ffa9847b9.jpg"></div>';
	exampleStr = exampleStr + '<div class="noise example"><p>No Graphics</p><p>Yes</p><br><img src="https://3dvision.princeton.edu/pvt/TurkCleaner/instruction/office_cubicles_00de42d92327b8f66ef7e0cddfa81f84.jpg"></div>';
	exampleStr = exampleStr + '<div class="noise example"><p>No Bad Photo</p><p>Yes</p><br><img src="https://3dvision.princeton.edu/pvt/TurkCleaner/instruction/cybercafe_2a150d58e415aad1eec95efc7cead821.jpg"></div>';
	exampleStr = exampleStr + '<br>'
	for (var i = 0; i < positive_examples.length; i++) {
		exampleStr = exampleStr + '<div class="target example"><p>Yes</p><p>Yes</p><br><img src=' + positive_examples[i].images + '></div>';
	}
	exampleStr = exampleStr + '<br>'
	// show negative examples
	for (var i = 0; i < negative_examples.length; i++) {
		exampleStr = exampleStr + '<div class="noise example"><p>No</p><p>Yes</p><br><img src=' + negative_examples[i].images + '></div>';
	}
	$('#exampleDiv').html(exampleStr);

	$('#submitid').attr('action', decodeURIComponent(turkSubmitTo + '/mturk/externalSubmit'));

	$(document).ready(function () {
		$(window).keydown(function (e) {
			e.preventDefault();
			var key = e.which | e.keyCode;
			eventScript = eventScript + currentTime() + 'up' + key + ';';
			if (!keyIsDown) {
				if (key === 39 || key == 68) {
					keyIsDown = true;
					if (currentIndex + 1 < data.length) {
						currentIndex = currentIndex + 1;
						displayFrame(currentIndex);
					}
					/*timerHandle =setInterval(function(){
						if (currentIndex+1<data.length) {
							currentIndex = currentIndex + 1;
							displayFrame(currentIndex);
						} else {
							clearInterval(timerHandle);
						}
					},400);*/
				}
				if (key === 37 || key == 65) {
					keyIsDown = true;
					if (currentIndex - 1 >= 0) {
						currentIndex = currentIndex - 1;
						displayFrame(currentIndex);
					}
					/*timerHandle =setInterval(function(){
						if (currentIndex-1>=0){
							currentIndex = currentIndex - 1;
							displayFrame(currentIndex);
						} else {
							clearInterval(timerHandle);
						}
					},400);*/
				}
			}
			updateSubmitButton();
		});

		$(window).keyup(function (e) {
			e.preventDefault();
			var key = e.which | e.keyCode;
			eventScript = eventScript + currentTime() + 'up' + key + ';';
			if (key === 32) {
				answerHit();
			}
			if (key === 37 || key == 65 || key === 39 || key == 68) {
				clearInterval(timerHandle);
				keyIsDown = false;
			}
			updateSubmitButton();
		});

		$('#imageCount').html(data.length);
		if (assignmentId != "ASSIGNMENT_ID_NOT_AVAILABLE") {
			document.getElementById('submitButton').value = 'Submit (' + data.length + ' images left)';
		}

		$('#startButton').show();

		workerId = gup('workerId');
		assignmentId = gup('assignmentId');

		if (assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE') {
			$("#startButton").html('accept the hit first before you can start');
			$('#startButton').attr("disabled", "disabled");
		} else {
			$("#startButton").html('Start');
			$('#startButton').removeAttr("disabled");
			eventScript = eventScript + currentTime() + 'ac;';
		}

		hitId = gup('hitId');
		gameId = gup('gameId');
		loadData();

		// start(); // TODO(ethan): remove this
	});
};