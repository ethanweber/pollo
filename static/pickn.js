// Handle keypresses for quick navigation of interface.
function picknKeyControls(keycode) {

    // if (GLOBAL_CURRENT_PAGE === "AnnotationTest") {
    //     switch (keycode) {
    //         case 66:
    //             // 'b' for back
    //             if (GLOBAL_ALL_CURRENT_IDX === 0) {
    //                 break;
    //             }
    //             picknSetCurrentAnnotationDiv(GLOBAL_ALL_CURRENT_IDX - 1);
    //             break;
    //     }
    // }
}

function picknIsGtCorrect(ious) {
    for (let i = 0; i < ious.length; i++) {
        let iou = ious[i];
        if (iou > 0.75) {
            return true;
        }
    }
    return false;
}

function picknIsGtCorrectWithAnswer(ious, index) {
    for (let i = 0; i < ious.length; i++) {
        let iou = ious[i];
        if (iou > 0.75 && i === index) {
            return true;
        }
    }
    return false;
}

// Set all content for the pickn task.
async function picknSetContent() {

    // hack to wait for loading before timer starts
    document.getElementById("AnnotationTestStartContent").classList.add("loader");
    document.getElementById("AnnotationTestQuestionsDiv").classList.add("loader");
    document.getElementById("GoToAnnotationTestButton").disabled = true;

    // INSTRUCTIONS
    document.getElementById("IntructionsContent").innerHTML = document.getElementById("picknInstructionsContent").innerHTML;

    // EXAMPLES ON MAIN PAGE
    document.getElementById("PicknExamples").classList.add("loader");
    let examples = await getExamplesDivsFromConfig(GLOBAL_CONFIG["EXAMPLES"]);
    document.getElementById("PicknExamples").classList.remove("loader");
    for (let i = 0; i < examples.length; i += 1) {
        let example = document.getElementById("ExampleTemplate");
        example.getElementsByClassName("ExampleTemplateClass1")[0].innerHTML = "Example " + (i + 1).toString();
        example.getElementsByClassName("ExampleTemplateContent1")[0].innerHTML = "";
        example.getElementsByClassName("ExampleTemplateContent1")[0].appendChild(examples[i]);
        // description will come later, when someone clicks
        var new_div = document.createElement("div");
        new_div.innerHTML = example.innerHTML;
        new_div.setAttribute("index", i);
        document.getElementById("PicknExamples").appendChild(new_div);
    }

    // SET UP THE REAL TEST
    document.getElementById("GoToAnnotationTestButton").disabled = true;
    let all_examples = await getExamplesDivsFromConfig(GLOBAL_ALL_EXAMPLES);
    document.getElementById("GoToAnnotationTestButton").disabled = false;
    document.getElementById("AnnotationTestQuestionsDiv").classList.remove("loader");
    document.getElementById("AnnotationTestStartContent").classList.remove("loader");
    // document.getElementById("AnnotationTestQuestionsDiv").classList.remove("loader");

    // SET THE CONTENT THE MAIN TASK DESCRIPTION
    document.getElementById("AnnotationTestStartContent").innerHTML = document.getElementById("picknRealTaskTemplate").innerHTML;
    document.getElementById("picknRealTaskTemplateClassNumImages").innerHTML = GLOBAL_ALL_EXAMPLES.length.toString();


    let all_indices = Array.from(Array(GLOBAL_ALL_EXAMPLES.length).keys()); //=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    shuffleArray(all_indices); // shuffle the order of the examples
    for (let i = 0; i < all_indices.length; i++) {
        let idx = all_indices[i];

        let div = all_examples[idx];
        let item = document.getElementById("PicknQuestionTemplate");
        item.getElementsByClassName("PicknQuestionImage")[0].innerHTML = "";
        item.getElementsByClassName("PicknQuestionImage")[0].appendChild(div);

        // CREATE AND SET DIV ID
        var new_div = document.createElement("div");
        new_div.id = "ALL_EXAMPLES:" + idx.toString();
        GLOBAL_ALL_IDS[i] = new_div.id;

        // i.e., given the index in the list... where is the original value
        GLOBAL_ALL_INDICES[idx] = i;

        new_div.innerHTML = item.innerHTML;
        new_div.style.display = "none";
        document.getElementById("AnnotationTestQuestionsDiv").appendChild(new_div);
    }

    // SET TO START AT BEGINNING OF TEST
    picknSetCurrentAnnotationDiv(0);
}

function picknSetCurrentAnnotationDiv(idx) {
    if (idx !== GLOBAL_ALL_CURRENT_IDX) {
        // console.log("moving on!");
        // let response = confirm("Are you sure you want to move on?");
        // if (response === false) {
        //     return;
        // }
    }
    // if exceed, then move into the next step
    if (idx === GLOBAL_ALL_IDS.length) {
        // TODO(show submit button)
        picknMaybeEnableSubmitButton();
        return;
    }

    // set and stop timer
    document.getElementById(GLOBAL_ALL_IDS[GLOBAL_ALL_CURRENT_IDX]).style.display = "none";
    document.getElementById(GLOBAL_ALL_IDS[idx]).style.display = "block";
    GLOBAL_ALL_CURRENT_IDX = idx;
    document.getElementById("AnnotationTestImageCount").innerHTML = (idx + 1).toString() + "/ " + (GLOBAL_ALL_IDS.length).toString();
}

function picknpicknGetPercentCorrect(start, end) {
    let num_correct = 0;
    let denom = 0;
    for (let i = start; i < end; i++) {
        let answer = GLOBAL_QUALIFICATION_RESPONSES[i];
        let correct = false;
        if (answer < 11) {
            correct = picknIsGtCorrectWithAnswer(GLOBAL_CONFIG["QUALIFICATION_EXAMPLES"][i]["ious"], GLOBAL_QUALIFICATION_RESPONSES[i]);
        } else if (answer === 11 && !picknIsGtCorrect(GLOBAL_CONFIG["QUALIFICATION_EXAMPLES"][i]["ious"])) {
            correct = true;
        }
        if (correct) {
            num_correct += 1;
        }
        denom += 1;
    }
    return num_correct / denom;
}

function picknGetSpeedMessage() {
    TotalTestTime = GLOBAL_END_QUALIFICATION_TEST - GLOBAL_START_QUALIFICATION_TEST;

    var tmpStrFeed = "<h3> You completed the qualification test in <strong>" + TotalTestTime.toString() + "</strong> seconds.</h3> <h5> The expected time was 50 seconds.</h5>";
    var SpeedComment = "";

    if (TotalTestTime > 2 * 50) {
        SpeedComment = "<h5>Your speed is very slow. If you continue with the same speed you will not manage to finish the HIT in the alloted time. Please <strong>do not</strong> take any breaks in the middle of the task. </h5>";
        tmpStrFeed = tmpStrFeed.concat(SpeedComment);
    } else if (TotalTestTime > 50) {
        SpeedComment = "<h5>Your speed is a bit slow. If you continue with the same speed you may not manage to finish the HIT in the alloted time. Please <strong>do not</strong> take any breaks in the middle of the task.</h5>";
        tmpStrFeed = tmpStrFeed.concat(SpeedComment);
    } else if (TotalTestTime <= 50) {
        SpeedComment = "<h5>Please continue doing the task with the same speed and <strong>do not</strong> take any breaks in the middle of the task.</h5>";
        tmpStrFeed = tmpStrFeed.concat(SpeedComment);
    }

    return tmpStrFeed;
}

function picknGetValidIndicesString(ious) {
    // find the indices that are correct
    let indices = "";
    for (let i = 0; i < ious.length; i++) {
        if (ious[i] > 0.75) {
            indices += i.toString() + ", ";
        }
    }
    if (indices === "") {
        indices = "None";
    }
    return indices;
}

function picknGetFeedbackContent(idx) {
    let answer = GLOBAL_QUALIFICATION_RESPONSES[idx];
    let isCorrect = false;
    if (answer < 11) {
        isCorrect = picknIsGtCorrectWithAnswer(GLOBAL_CONFIG["QUALIFICATION_EXAMPLES"][idx]["ious"], answer);
    } else if (answer === 11 && !picknIsGtCorrect(GLOBAL_CONFIG["QUALIFICATION_EXAMPLES"][idx]["ious"])) {
        isCorrect = true;
    }
    let FeedbackText = "";
    let FeedbackTextColor = "";

    let valid_indices_string = picknGetValidIndicesString(GLOBAL_CONFIG["QUALIFICATION_EXAMPLES"][idx]["ious"]);

    if (isCorrect) {
        FeedbackText = "Well done! Your answer was correct."
        FeedbackTextColor = "green";
    } else {
        FeedbackText = "Sorry. Your answer is wrong.";
        FeedbackTextColor = "red";
    }

    let qual_result_template = document.getElementById("QualificationResultTemplate");
    qual_result_template.getElementsByClassName("QualificationResultTemplate1")[0].innerHTML = "TODO";//GLOBAL_CLASS_IDX_TO_CLASS_NAME[GLOBAL_CONFIG["QUALIFICATION_EXAMPLES"][idx]["class_idx"]];

    // show the image as well
    qual_result_template.getElementsByClassName("QualificationResultTemplate2")[0].innerHTML =
        document.getElementById(GLOBAL_QUALIFICATION_IDS[idx]).getElementsByClassName("PicknQuestionImage")[0].innerHTML;

    FeedbackText = "<font color='" + FeedbackTextColor + "'>" + FeedbackText + "</font>";
    if (answer === 11) {
        answer = "None";
    }
    qual_result_template.getElementsByClassName("QualificationResultTemplate3")[0].innerHTML = "The valid indices are " + valid_indices_string + ", and you said " + answer + ".<br>";
    qual_result_template.getElementsByClassName("QualificationResultTemplate3")[0].innerHTML += FeedbackText;
    qual_result_template.getElementsByClassName("QualificationResultTemplate3")[0].innerHTML += "<hr>";

    return qual_result_template.innerHTML;
}

// Get the items for any given page.
async function getExamplesDivsFromConfig(example) {
    let examples = [];
    for (let i = 0; i < example.length; i++) {
        examples.push(getBiasganAnnotationAsDiv(example[i]));
    }
    return await Promise.all(examples);
}

function picknGetAnswerAsString() {
    // we care about for the answer
    let answer = {};
    answer["GLOBAL_ALL_IDS"] = GLOBAL_ALL_IDS; // preserve order for responses
    answer["GLOBAL_ALL_INDICES"] = GLOBAL_ALL_INDICES;
    answer["GLOBAL_CONFIG_NAME"] = GLOBAL_CONFIG_NAME; // keep track of config name
    answer["GLOBAL_ALL_RESPONSES"] = GLOBAL_ALL_RESPONSES; // answers for those ideas

    // let GT_HIDDEN_EXAMPLES_RESPONSES = [];
    // TODO(ethan): here!
    answer["GT_HIDDEN_EXAMPLES_RESPONSES"] = [];
    answer["GT_HIDDEN_EXAMPLES_RESPONSES_REVERSED"] = [];
    answer["QUERY_EXAMPLES_RESPONSES"] = [];
    for (let i = 0; i < GLOBAL_ALL_INDICES.length; i++) {
        let idx = GLOBAL_ALL_INDICES[i];
        if (i < GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"].length) {
            answer["GT_HIDDEN_EXAMPLES_RESPONSES"].push(GLOBAL_ALL_RESPONSES[idx]);
        } else if (i < GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"].length * 2) {
            answer["GT_HIDDEN_EXAMPLES_RESPONSES_REVERSED"].push(GLOBAL_ALL_RESPONSES[idx]);
        } else {
            answer["QUERY_EXAMPLES_RESPONSES"].push(GLOBAL_ALL_RESPONSES[idx]);
        }
    }

    answer["GLOBAL_REAL_TEST_TIME"] = GLOBAL_END_REAL_TEST - GLOBAL_START_REAL_TEST; // time for the test


    // $('#global_config').val(GLOBAL_CONFIG);
    // save the entire config
    answer["GLOBAL_CONFIG"] = GLOBAL_CONFIG;

    return JSON.stringify(answer);
}



function picknGetNumCorrect() {
    // also set the responses
    let num_correct = 0;
    for (let i = 0; i < GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"].length; i++) {
        let idx = GLOBAL_ALL_INDICES[i];
        let idx_flipped = GLOBAL_ALL_INDICES[i + GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"].length];
        if (GLOBAL_ALL_RESPONSES[idx] !== GLOBAL_ALL_RESPONSES[idx_flipped]) {
            num_correct += 1;
        }
    }
    return num_correct;
}

function picknAttemptSubmit() {
    let endpoint = decodeURIComponent(TURK_SUBMIT_TO + '/mturk/externalSubmit');
    $('#submitid').attr('action', endpoint);
    $('#assignment').val(ASSIGNMENT_ID);
    let answer = picknGetAnswerAsString();
    console.log(answer);
    // answer
    // $('#global_config').val(GLOBAL_CONFIG);
    $('#answer').val(answer);
    document.getElementById("submitid").submit();
}

function picknMaybeEnableSubmitButton() {
    let num_correct = picknGetNumCorrect();
    goToPage("Finish");
    if ((GLOBAL_END_REAL_TEST - GLOBAL_START_REAL_TEST) <= GLOBAL_MIN_TIME_PER_EXAMPLE * GLOBAL_ALL_IDS.length) {
        let time_used = GLOBAL_END_REAL_TEST - GLOBAL_START_REAL_TEST;
        document.getElementById("FinishHeading").innerHTML = "Task Failed";
        document.getElementById("FinishText").innerHTML = "<p>You went too fast, completing the HIT in " + time_used.toString() + " seconds, or (" + (time_used / 60.0).toString() + " minutes), much faster that the suggested time.</p>";
        return;
    } else if (num_correct >= GLOBAL_CONFIG["GT_HIDDEN_EXAMPLES"].length) {
        document.getElementById("FinishHeading").innerHTML = "Task Completed";
    } else {
        document.getElementById("FinishHeading").innerHTML = "Task Failed";
        document.getElementById("FinishText").innerHTML = "<p>Your consitency for this HIT was quite low. Please return the HIT.</p>";
        document.getElementById("FinishText").innerHTML += "<p>If you would like to try again, we suggest pay careful attention to your responses.</p>"
        return;
    }
    document.getElementById("submitButton").disabled = false;
}

function picknClearAllHighlights() {
    let elements = document.getElementById(GLOBAL_ALL_IDS[GLOBAL_ALL_CURRENT_IDX]).getElementsByTagName("button");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.border = "";
    }
}

function isDesktop() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return false;
    } else {
        return true;
    }
}

function picknLeftClickControls(e) {
    // handle left click
    let clickedIndex = null;
    // if (e.button == 0 && (e.target.tagName == "svg" || e.target.tagName == "polygon")) {
    if (e.button == 0 && e.target.tagName == "BUTTON") {
        if (GLOBAL_CURRENT_PAGE === "Instructions") {
            // deal with someone clicking buttons in the instructions
            clickedIndex = parseInt(e.target.innerHTML);
            // this should be the div of the example element!
            let element = e.target.parentNode.parentNode.parentNode.parentNode.parentNode;
            let index = element.getAttribute("index");
            element.getElementsByClassName("ExampleTemplateText1")[0].innerHTML = GLOBAL_CONFIG["EXAMPLES"][index]["description"] + "<hr>";
            GLOBAL_EXAMPLE_RESPONSES[index] = true;

            // check if all descriptions are shown in order to move on
            let enable_proceed = true;
            for (let i = 0; i < GLOBAL_EXAMPLE_RESPONSES.length; i += 1) {
                if (GLOBAL_EXAMPLE_RESPONSES[i] === false) {
                    enable_proceed = false;
                }
            }
            // if (enable_proceed && isDesktop()) {
            //     document.getElementById("proceedButton").disabled = false;
            // }
            if (enable_proceed) {
                document.getElementById("proceedButton").disabled = false;
            }
        }
        else if (GLOBAL_CURRENT_PAGE === "AnnotationTest") {
            picknClearAllHighlights();
            e.target.style.border = "10px solid green";
            clickedIndex = parseInt(e.target.innerHTML);
            setTimeout(function () {
                // set the index as an answer
                if (GLOBAL_CURRENT_PAGE === "AnnotationTest") {
                    GLOBAL_ALL_RESPONSES[GLOBAL_ALL_CURRENT_IDX] = clickedIndex;
                    // picknSetCurrentAnnotationDiv(GLOBAL_ALL_CURRENT_IDX + 1);
                    // document.getElementById("submitButton").disabled = false;
                    let elements = document.getElementById(GLOBAL_ALL_IDS[GLOBAL_ALL_CURRENT_IDX]).getElementsByClassName("proceedToNextQuestionClass");
                    // console.log(elements);
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].disabled = false;
                    }
                }
            }, 250);
        }
    }
}

function picknProceedToNextQuestion() {
    picknSetCurrentAnnotationDiv(GLOBAL_ALL_CURRENT_IDX + 1)
}