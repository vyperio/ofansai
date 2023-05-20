

async function checkActiveTabUrl() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    if (tab === undefined) {
        //console.log("No active tab found");
        return;
    }
    var activeTabUrl = tab.url;
    var regex = /^https:\/\/onlyfans\.com\/my\/chats\/chat\/.+/;
    if (regex.test(activeTabUrl)) {
        //console.log('Messages', activeTabUrl);
    } else {
        //console.log('Not Messages', activeTabUrl);
        var divWarning = document.querySelector(".warning");
        divWarning.innerHTML = 'To use this feature navigate to an individual message chat window and re-open the extension.';
        divWarning.style.color = "red";
        var button = document.getElementById("button");
        button.className += " off";
        button.disabled = true;

    }
}
checkActiveTabUrl();


// Get the current tab and chat content. Action aPI and sendMessage to promptResult listener
const func = async (responseWords, responseTone, responseQuestion, responseEmoji, responseShort) => {
    //console.log("webpage");
    //console.log(document.querySelector('div:not(.b-chats__item.m-with-rectangle-hover.current) .g-user-name.m-md-size').innerText);


    // Get form data

    // scroll by 3000 px up and wait 2000 miliseconds for div content to load then scrape
    let chatScrollbar = document.querySelector('.b-chats__scrollbar.m-custom-scrollbar.b-chat__messages.m-native-custom-scrollbar.m-scrollbar-y.m-scroll-behavior-auto');
    chatScrollbar.scrollTop = chatScrollbar.scrollTop - 3000;
    let interval = setInterval(async function () {
        let chatMessages = document.querySelectorAll('.b-chat__message__text');
        if (chatMessages.length > 0) {
            clearInterval(interval);
            let content = [];


            chatMessages.forEach(async function (chatMessage) {
                let parentDiv = chatMessage.closest('.m-from-me');
                let text = chatMessage.innerText;
                if (parentDiv) {
                    content.push("Person A: " + text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " "));
                } else {
                    content.push("Person B: " + text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " "));
                }
            });

            let contentString = content.join(' ');
            //console.log(contentString);

            //console.log(responseWords);

            //console.log(responseTone);
            //console.log(responseQuestion);
            //console.log(responseEmoji);


            // Create a function that returns a promise that resolves with the user ID
            function getUserId() {
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({ command: "checkAuth" }, (response) => {
                        if (response.status === "success") {
                            resolve(response.message.uid);
                        } else {
                            reject(new Error("Failed to get user ID"));
                        }
                    });
                });
            }

            var data = {
                "convo": contentString,
                "tone": responseTone,
                "words": responseWords,
                "question": responseQuestion,
                "emoji": responseEmoji
            };

            //console.log('responseShort: ', responseShort);
            // If short checked limit tokens to generate shorter reply
            if (responseShort) {
                data.ai_max_tokens = 45;
            };
            //console.log('new data: ', data);



            //console.log("test", data);

            function cutOffIncompleteSentence(text) {
                // Split the text into an array of words
                const words = text.split(' ');

                // Check if the last character of the text is not a punctuation character
                if (['.', '!', '?'].indexOf(text[text.length - 1]) === -1) {
                    // If it is not, then loop through the words in reverse order
                    for (let i = words.length - 1; i >= 0; i--) {
                        // If the word ends with a punctuation character, then return the text up to that point
                        if (['.', '!', '?'].indexOf(words[i][words[i].length - 1]) !== -1) {
                            // Check if there is an emoji character after the punctuation character, including any space characters
                            if (/\u{1F600}-\u{1F64F}/.test(words[i].slice(-1))) {
                                // If there is, include it in the returned text
                                return words.slice(0, i + 1).join(' ') + words[i].slice(-1);
                            } else {
                                // If there is not, do not include it in the returned text
                                return words.slice(0, i + 1).join(' ');
                            }
                        }
                    }
                }

                // If the last character is a punctuation character or no punctuation character was found, return the original text
                return text;
            }





            // get userID and only then send the postAPI event
            getUserId().then((userId) => {
                data.user = userId;
                //console.log("NEW USER", userId);
                // Now you can use the data object with the updated user ID
                //console.log(data);



                chrome.runtime.sendMessage({
                    type: "postAPI",
                    data: data
                }, (response) => {

                    // //console.log(response.data);
                    //console.log('####');
                    let oresponse = response.data.replace(/\n/g, "");
                    //console.log(oresponse);
                    // return oresponse;

                    // Split the text into an array of words
                    truncatedText = cutOffIncompleteSentence(oresponse);
                    oresponse = truncatedText;





                    userReply = document.querySelector('div:not(.b-chats__item.m-with-rectangle-hover.current) .g-user-name.m-md-size').innerText;

                    chrome.runtime.sendMessage({
                        type: "promptResult",
                        data: oresponse,
                        status: response.status
                    }, (response) => { });

                    chrome.runtime.sendMessage({
                        type: "updateUserReply",
                        data: userReply
                    }, (response) => { });

                });

            });

        }
    }, 2000); // check every 2000 milliseconds

}


// On button click Generate action run func
document.getElementById("button").onclick = () => {
    //console.log("popup");

    // Disable button to prevent multiple clicks
    // var button = document.getElementById("button");
    // button.disabled = true;
    // let svg = '<svg width="15" height="20" viewBox="0 0 135 140" xmlns="http://www.w3.org/2000/svg" fill="#fff"><rect y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.5s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.5s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="30" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.25s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.25s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="60" width="15" height="140" rx="6"><animate attributeName="height" begin="0s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="90" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.25s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.25s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="120" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.5s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.5s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect></svg>';
    // let divNew = document.createElement("div");
    // divNew.innerHTML = svg;
    // button.appendChild(divNew);
    // button.textContent += 'Generating';


    var button = document.getElementById("button");
    
    //console.log('button', button);

    button.disabled = true;

    button.innerHTML = "";

    let svg = '<svg width="15" height="20" viewBox="0 0 135 140" xmlns="http://www.w3.org/2000/svg" fill="#fff"><rect y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.5s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.5s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="30" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.25s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.25s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="60" width="15" height="140" rx="6"><animate attributeName="height" begin="0s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="90" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.25s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.25s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="120" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.5s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.5s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect></svg>';
    let divNew = document.createElement("div");
    divNew.innerHTML = svg;
    divNew.style.margin = '5px 0px 0px 0px';
    button.appendChild(divNew);
    button.innerHTML += 'Generating';
    button.style.display = 'flex';
    button.style.gap = '7px';
    button.style.fontSize = '14px';
    button.style.lineHeight = '32px';
    button.style.cursor = 'none';
    button.style.padding = '5px 30px 5px 8px';
    button.style.color = '#fff';


    // Get Form data and pass to func
    let inputWords = document.getElementById('input-words');
    let inputTone = document.getElementById('input-tone');
    let inputQuestion = document.getElementById('input-question');
    let inputEmoji = document.getElementById('input-emoji');
    let inputShort = document.getElementById('input-short');



    let responseTone;
    if (inputTone.value.length > 0) {
        responseTone = inputTone.value;
    } else {
        responseTone = "";
    }
    let responseWords;
    if (inputWords.value.length > 0) {
        responseWords = inputWords.value;
    } else {
        responseWords = "";
    }
    let responseQuestion;
    if (inputQuestion.value.length > 0) {
        responseQuestion = inputQuestion.value;
    } else {
        responseQuestion = "";
    }
    let responseEmoji;
    if (inputEmoji.checked) {
        responseEmoji = true;
    } else {
        responseEmoji = false;
    }

    let responseShort;
    if (inputShort.checked) {
        responseShort = true;
    } else {
        responseShort = false;
    }



    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: func,
            args: [responseWords, responseTone, responseQuestion, responseEmoji, responseShort]
        });
    });

}



// Listen for API response and update extension popup DOM
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "promptResult") {

        // Enable button again
        var button = document.getElementById("button");
        button.disabled = false;
        button.innerHTML = '';
        // button.textContent = 'Suggest Reply';
        let svg = `<svg width="22" height="30" viewBox="0 0 66 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M65.5849 48.8534C65.5849 48.8534 65.5854 47.3912 65.5854 46.3912C65.5854 44.8912 65.5854 44.3912 65.5854 43.3912C65.5854 42.3912 65.5849 40.7256 65.5849 40.7256V36.6922C65.5849 33.484 64.3048 30.4067 62.026 28.1375C59.7472 25.8683 56.6568 24.5936 53.435 24.5936H37.2347V19.4422C39.3087 18.2499 40.746 16.2055 41.1617 13.8575C41.5773 11.51 40.9292 9.09914 39.3901 7.27278C37.851 5.44658 35.579 4.39124 33.1849 4.39124C30.7909 4.39124 28.5189 5.44649 26.9798 7.27278C25.4408 9.09897 24.7925 11.51 25.2082 13.8575C25.6238 16.2057 27.0612 18.25 29.1352 19.4422V24.5936H12.9349C9.71309 24.5936 6.62267 25.8683 4.34387 28.1375C2.06507 30.4067 0.784996 33.484 0.784996 36.6922V40.7249V41.6328L0.784943 43.0874L0.784954 46.3817C0.784954 46.3817 0.911266 49.3124 0.784961 49.4621L0.784996 52.8241V56.8568C0.785674 59.5053 1.65826 62.0811 3.26913 64.1882C4.88076 66.2952 7.1413 67.8184 9.70545 68.5233C10.6058 68.7312 11.4113 69.2308 11.9957 69.9438C12.5801 70.6567 12.9103 71.5432 12.9348 72.4627V75.3503C12.932 76.4265 13.3612 77.4594 14.128 78.2184C14.8942 78.9779 15.9335 79.3999 17.0143 79.3911C18.0815 79.3911 19.1033 78.9624 19.8484 78.2022L27.9486 70.1362C28.7079 69.3794 29.7384 68.9554 30.8125 68.9554H53.4356C56.6574 68.9554 59.7478 67.6807 62.0266 65.4115C64.3054 63.1431 65.5854 60.0657 65.5854 56.8568V52.8242L65.5849 51.8912C65.5849 51.3912 65.5854 50.2702 65.5854 50.2702L65.5849 48.8534ZM61.5345 56.8568C61.5324 58.995 60.6781 61.0453 59.1593 62.5576C57.6413 64.0693 55.5822 64.92 53.435 64.9228H30.8119C28.6626 64.9167 26.6001 65.7674 25.0841 67.2851L16.9839 75.3511V72.4635C16.9656 70.6589 16.3473 68.9101 15.2244 67.493C14.101 66.0766 12.5376 65.0712 10.7788 64.6345C9.0709 64.1625 7.56566 63.1465 6.49248 61.7415C5.41919 60.3372 4.83678 58.6217 4.83475 56.8568V36.6919C4.83678 34.5537 5.69107 32.5034 7.20988 30.9917C8.72794 29.4794 10.787 28.6287 12.9342 28.6266H53.435C55.5823 28.6287 57.6413 29.4793 59.1594 30.9917C60.6781 32.5034 61.5324 34.5537 61.5345 36.6919L61.5345 56.8568ZM25.0848 46.7749C25.0848 48.379 24.4447 49.9177 23.3057 51.0519C22.1666 52.1868 20.6214 52.8242 19.0098 52.8242C17.3989 52.8242 15.8536 52.1868 14.7147 51.0519C13.5749 49.9176 12.9349 48.379 12.9349 46.7749C12.9349 45.17 13.5749 43.6313 14.7147 42.4971C15.8537 41.3629 17.3989 40.7256 19.0098 40.7256C20.6215 40.7256 22.1667 41.3629 23.3057 42.4971C24.4447 43.6314 25.0848 45.1701 25.0848 46.7749ZM53.434 46.7749C53.434 48.379 52.7946 49.9177 51.6549 51.0519C50.5158 52.1868 48.9706 52.8242 47.3597 52.8242C45.7481 52.8242 44.2028 52.1868 43.0638 51.0519C41.9248 49.9176 41.2847 48.379 41.2847 46.7749C41.2847 45.17 41.9248 43.6313 43.0638 42.4971C44.2029 41.363 45.7481 40.7256 47.3597 40.7256C48.9706 40.7256 50.5159 41.3629 51.6549 42.4971C52.7946 43.6314 53.434 45.1701 53.434 46.7749Z" fill="white"/>
    <path d="M33.3058 25.3239L33.1899 25.3912L33.1203 25.3492C11.1568 12.5732 18.6944 0.24375 26.847 0.392569C27.1078 0.392569 27.3718 0.417819 27.6326 0.448745C30.9143 0.833165 32.4595 2.59535 33.19 4.11051C33.9176 2.59535 35.4658 0.83317 38.7474 0.462624C47.1516 -0.539127 55.9042 12.1442 33.306 25.324L33.3058 25.3239Z" fill="white"/>
    </svg>`;
        let divNew = document.createElement("div");
        divNew.innerHTML = svg;
        button.appendChild(divNew);

        button.innerHTML += 'Suggest Reply';
        // button.style.lineHeight = '24px';
        // button.style.display = 'flex';
        // button.style.gap = '7px';
        // button.style.height = '34px';
        // button.style.color = '#ffffff';
        // button.style.border = '1px solid #000';
        // button.style.padding = '4px 10px 7px 7px';
        // button.style.margin = '0px 6px 0px 0px';
        // button.style.background = '#0074eb';
        button.style.cursor = 'pointer';
        // button.style.borderRadius = '5px';
        button.style.fontSize = '14px';



        // Show buttons copy and populate reply field
        let copyResponseButton = document.getElementById("copyResponse");
        let populateResponseButton = document.getElementById("populateResponse");
        copyResponseButton.classList.remove('invisible');
        populateResponseButton.classList.remove('invisible');

        // //console.log(request.data);
        oresponse = request.data;

        // clean response of Person A string and any characters before it
        var regex = /.*Person A:|.*A:|^[^a-zA-Z]+/;
        var regex1 = /.* A:/;
        var regex2 = /Person[ ]?B/;

        oresponse = oresponse.replace(regex, "");
        oresponse = oresponse.replace(regex1, "");
        oresponse = oresponse.replace(regex2, "");
        //console.log("request status ", request.status);
        //console.log("request data ", request.data);
        if (request.status === false) {
            var res = document.getElementById("responses");
            res.style.color = 'red';
        } else {
            var res = document.getElementById("responses");
            res.style.color = 'black';
        }
        document.getElementById("responses").style.display = "block";
        document.getElementById("copyResponse").style.display = "block";
        document.getElementById("populateResponse").style.display = "block";

        document.getElementById("responses").innerHTML = oresponse;

        // Set repspone in localstorage if someone closes popup.
        chrome.runtime.sendMessage(
            { command: "setTempResponse", data: oresponse },
            (response) => {
                //console.log("setTempResponse", response);
            }
        );

        sendResponse({ type: "promptResult", status: "success", message: true });



    } else if (request.type === "updateUserReply") {
        userReply = request.data;
        userReply = "Reply to @" + userReply;
        document.getElementById("userReply").innerHTML = userReply;
        sendResponse({ type: "promptResult", status: "success", message: true });
    }
    return true; // Required to use sendResponse asynchronously
});

// Get temp response from localstorage
const tempResponse = chrome.runtime.sendMessage({
    command: "getTempResponse",
});
// Print temp response if exists
let tempResponseResult = "";
tempResponse.then(function (response) {
    // //console.log("tempResponse from storage", response.message);
    tempResponseResult = response.message;
    // //console.log('tempResponseResult', tempResponseResult);
    if (tempResponseResult) {
        document.getElementById("responses").style.display = "block";
        document.getElementById("copyResponse").style.display = "block";
        document.getElementById("populateResponse").style.display = "block";
        document.getElementById("responses").innerHTML = tempResponseResult;
    }
});




// Button click
// Copy to clipboard
document.getElementById("copyResponse").onclick = () => {
    //console.log("copyResponse");
    copyText();
}

function copyText() {
    var text = document.getElementById("responses").innerHTML;
    navigator.clipboard.writeText(text);
}

// Button click
// Populate reply field on button click
document.getElementById("populateResponse").onclick = () => {
    //console.log("populateResponse");
    populateResponse();
}

function populateResponse() {
    var text = document.getElementById("responses").innerHTML;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: populateResponseTrigger,
            args: [text]
        });
    });
}

function populateResponseTrigger(text) {
    // Listener and functio to populate reply field 

    // Inject into textarea. Web app using vue. So need to inject into vue data.
    // Functino to add isTrusted true tag into 2 event objects
    function injectTextIntoTextarea(textarea, text) {
        // Set the value of the textarea
        textarea.value = text;

        // Create a new custom event
        var textEvent = document.createEvent('Event');
        textEvent.initEvent('textInput', true, true);
        textEvent.data = text;
        textEvent.inputType = 'insertText';
        textEvent.isComposing = false;
        textEvent.isTrusted = true;

        // Dispatch the custom event
        textarea.dispatchEvent(textEvent);

        // Create a new custom event
        var inputEvent = document.createEvent('Event');
        inputEvent.initEvent('input', true, true);
        inputEvent.data = text;
        inputEvent.inputType = 'insertText';
        inputEvent.isComposing = false;
        inputEvent.isTrusted = true;

        // Dispatch the custom event
        textarea.dispatchEvent(inputEvent);
    }

    // Inject text into textarea
    var textarea = document.getElementById('new_post_text_input');
    //////
    // REPLACE TEXT HERE
    //////
    injectTextIntoTextarea(textarea, text);
}