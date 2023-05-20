// Comments Support
// - My Profile Page
// - Individual Post Pages
// - Works on refresh and when browsing my profile app secion.


// get messages from message window
function getMessages(parentDiv) {
    let contentString = "";
    //console.log('getMessages()');
    // scroll by 3000 px up and wait 2000 miliseconds for div content to load then scrape
    let chatScrollbar = document.querySelector('.b-chats__scrollbar.m-custom-scrollbar.b-chat__messages.m-native-custom-scrollbar.m-scrollbar-y.m-scroll-behavior-auto');
    chatScrollbar.scrollTop = chatScrollbar.scrollTop - 3000;
    return new Promise((resolve) => {
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

                contentString = content.join(' ');
            }

            //console.log('contentString: ', contentString);
            resolve(contentString);
        }, 2000); // check every 2000 milliseconds
        // return contentString;
        // commentsText < holds the convo
    });
}



// get the last 6 comments from the my profile view and generate convo to send to prompt
function getCommentsConvo(parentDiv) {
    var globalUsername = document.querySelector('.g-user-name').innerText.trim();
    // Step 2: select all inner text in divs with class b-comments__item-text
    var commentsList = parentDiv.querySelector('.b-comments__list');
    var comments = commentsList.querySelectorAll('.b-comments__item-text');
    comments = Array.prototype.slice.call(comments, 0, 6);
    comments.reverse();

    // Step 3: for all strings append string "Persona A: " to all inner text where comments__item-text and b-username-row a href parent div before each b-comments__item-text = the string from step 1 and append "Person B: " for all others
    var commentsText = "";
    for (var i = 0; i < comments.length; i++) {
        var comment = comments[i].innerText;
        var username = comments[i].parentNode.querySelector('.g-user-name').innerText;
        //console.log(username);
        if (username === globalUsername) {
            commentsText += "Person A: " + comment + " ";
        } else {
            commentsText += "Person B: " + comment + " ";
        }
    }
    return commentsText;
    // commentsText < holds the convo
    //console.log(commentsText);
}




// Function to disable button
function disableButton(parentDiv, buttonId, type) {
    //console.log('disableButton buttonId', buttonId);
    var button = document.getElementById("suggestPost " + buttonId.toString());
    //console.log('button', button);

    button.disabled = true;

    button.innerHTML = "";

    let svg = '<svg width="15" height="20" viewBox="0 0 135 140" xmlns="http://www.w3.org/2000/svg" fill="#fff"><rect y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.5s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.5s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="30" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.25s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.25s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="60" width="15" height="140" rx="6"><animate attributeName="height" begin="0s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="90" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.25s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.25s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect><rect x="120" y="10" width="15" height="120" rx="6"><animate attributeName="height" begin="0.5s" dur="1s" values="120;110;100;90;80;70;60;50;40;140;120" calcMode="linear" repeatCount="indefinite" /><animate attributeName="y" begin="0.5s" dur="1s" values="10;15;20;25;30;35;40;45;50;0;10" calcMode="linear" repeatCount="indefinite" /></rect></svg>';
    let divNew = document.createElement("div");
    divNew.innerHTML = svg;
    button.appendChild(divNew);
    button.innerHTML += 'Generating';
    button.style.lineHeight = '20px';
    button.style.display = 'flex';
    button.style.gap = '7px';
    button.style.height = '34px';
    button.style.cursor = 'none';
    button.style.padding = '6px 10px 5px 7px';
    if (type === 'comments') {
        button.style.margin = '7px 0px 0px 0px';
    } else {
        button.style.margin = '0px 6px 0px 0px';
    }
    button.style.color = 'white';
    button.style.border = '1px solid #000';
    button.style.background = '#0074eb';

}

// Function to enable button
function enableButton(parentDiv, buttonId, type) {
    var button = document.getElementById("suggestPost " + buttonId.toString());
    button.disabled = false;

    button.innerHTML = "";
    let svg = `<svg width="18" height="24" viewBox="0 0 66 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M65.5849 48.8534C65.5849 48.8534 65.5854 47.3912 65.5854 46.3912C65.5854 44.8912 65.5854 44.3912 65.5854 43.3912C65.5854 42.3912 65.5849 40.7256 65.5849 40.7256V36.6922C65.5849 33.484 64.3048 30.4067 62.026 28.1375C59.7472 25.8683 56.6568 24.5936 53.435 24.5936H37.2347V19.4422C39.3087 18.2499 40.746 16.2055 41.1617 13.8575C41.5773 11.51 40.9292 9.09914 39.3901 7.27278C37.851 5.44658 35.579 4.39124 33.1849 4.39124C30.7909 4.39124 28.5189 5.44649 26.9798 7.27278C25.4408 9.09897 24.7925 11.51 25.2082 13.8575C25.6238 16.2057 27.0612 18.25 29.1352 19.4422V24.5936H12.9349C9.71309 24.5936 6.62267 25.8683 4.34387 28.1375C2.06507 30.4067 0.784996 33.484 0.784996 36.6922V40.7249V41.6328L0.784943 43.0874L0.784954 46.3817C0.784954 46.3817 0.911266 49.3124 0.784961 49.4621L0.784996 52.8241V56.8568C0.785674 59.5053 1.65826 62.0811 3.26913 64.1882C4.88076 66.2952 7.1413 67.8184 9.70545 68.5233C10.6058 68.7312 11.4113 69.2308 11.9957 69.9438C12.5801 70.6567 12.9103 71.5432 12.9348 72.4627V75.3503C12.932 76.4265 13.3612 77.4594 14.128 78.2184C14.8942 78.9779 15.9335 79.3999 17.0143 79.3911C18.0815 79.3911 19.1033 78.9624 19.8484 78.2022L27.9486 70.1362C28.7079 69.3794 29.7384 68.9554 30.8125 68.9554H53.4356C56.6574 68.9554 59.7478 67.6807 62.0266 65.4115C64.3054 63.1431 65.5854 60.0657 65.5854 56.8568V52.8242L65.5849 51.8912C65.5849 51.3912 65.5854 50.2702 65.5854 50.2702L65.5849 48.8534ZM61.5345 56.8568C61.5324 58.995 60.6781 61.0453 59.1593 62.5576C57.6413 64.0693 55.5822 64.92 53.435 64.9228H30.8119C28.6626 64.9167 26.6001 65.7674 25.0841 67.2851L16.9839 75.3511V72.4635C16.9656 70.6589 16.3473 68.9101 15.2244 67.493C14.101 66.0766 12.5376 65.0712 10.7788 64.6345C9.0709 64.1625 7.56566 63.1465 6.49248 61.7415C5.41919 60.3372 4.83678 58.6217 4.83475 56.8568V36.6919C4.83678 34.5537 5.69107 32.5034 7.20988 30.9917C8.72794 29.4794 10.787 28.6287 12.9342 28.6266H53.435C55.5823 28.6287 57.6413 29.4793 59.1594 30.9917C60.6781 32.5034 61.5324 34.5537 61.5345 36.6919L61.5345 56.8568ZM25.0848 46.7749C25.0848 48.379 24.4447 49.9177 23.3057 51.0519C22.1666 52.1868 20.6214 52.8242 19.0098 52.8242C17.3989 52.8242 15.8536 52.1868 14.7147 51.0519C13.5749 49.9176 12.9349 48.379 12.9349 46.7749C12.9349 45.17 13.5749 43.6313 14.7147 42.4971C15.8537 41.3629 17.3989 40.7256 19.0098 40.7256C20.6215 40.7256 22.1667 41.3629 23.3057 42.4971C24.4447 43.6314 25.0848 45.1701 25.0848 46.7749ZM53.434 46.7749C53.434 48.379 52.7946 49.9177 51.6549 51.0519C50.5158 52.1868 48.9706 52.8242 47.3597 52.8242C45.7481 52.8242 44.2028 52.1868 43.0638 51.0519C41.9248 49.9176 41.2847 48.379 41.2847 46.7749C41.2847 45.17 41.9248 43.6313 43.0638 42.4971C44.2029 41.363 45.7481 40.7256 47.3597 40.7256C48.9706 40.7256 50.5159 41.3629 51.6549 42.4971C52.7946 43.6314 53.434 45.1701 53.434 46.7749Z" fill="white"/>
    <path d="M33.3058 25.3239L33.1899 25.3912L33.1203 25.3492C11.1568 12.5732 18.6944 0.24375 26.847 0.392569C27.1078 0.392569 27.3718 0.417819 27.6326 0.448745C30.9143 0.833165 32.4595 2.59535 33.19 4.11051C33.9176 2.59535 35.4658 0.83317 38.7474 0.462624C47.1516 -0.539127 55.9042 12.1442 33.306 25.324L33.3058 25.3239Z" fill="white"/>
    </svg>`;
    let divNew = document.createElement("div");
    divNew.innerHTML = svg;
    button.appendChild(divNew);
    button.innerHTML += 'Suggest Reply';
    button.style.lineHeight = '24px';
    button.style.display = 'flex';
    button.style.gap = '7px';
    button.style.height = '34px';
    button.style.color = '#ffffff';
    button.style.border = '1px solid #000';
    button.style.padding = '4px 10px 7px 7px';
    if (type === 'comments') {
        button.style.margin = '7px 0px 0px 0px';
    } else {
        button.style.margin = '0px 6px 0px 0px';
    }
    button.style.background = '#0074eb';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '5px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';


}

// MESSAGES: create button function
function createButtonMessages(parentDiv) {
    // Create the new button element
    var button = document.createElement('a');
    // let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bullseye" viewBox="0 0 16 16">
    // <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    // <path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10zm0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
    // <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
    // <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    // </svg>`;
    let svg = `<svg width="18" height="24" viewBox="0 0 66 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M65.5849 48.8534C65.5849 48.8534 65.5854 47.3912 65.5854 46.3912C65.5854 44.8912 65.5854 44.3912 65.5854 43.3912C65.5854 42.3912 65.5849 40.7256 65.5849 40.7256V36.6922C65.5849 33.484 64.3048 30.4067 62.026 28.1375C59.7472 25.8683 56.6568 24.5936 53.435 24.5936H37.2347V19.4422C39.3087 18.2499 40.746 16.2055 41.1617 13.8575C41.5773 11.51 40.9292 9.09914 39.3901 7.27278C37.851 5.44658 35.579 4.39124 33.1849 4.39124C30.7909 4.39124 28.5189 5.44649 26.9798 7.27278C25.4408 9.09897 24.7925 11.51 25.2082 13.8575C25.6238 16.2057 27.0612 18.25 29.1352 19.4422V24.5936H12.9349C9.71309 24.5936 6.62267 25.8683 4.34387 28.1375C2.06507 30.4067 0.784996 33.484 0.784996 36.6922V40.7249V41.6328L0.784943 43.0874L0.784954 46.3817C0.784954 46.3817 0.911266 49.3124 0.784961 49.4621L0.784996 52.8241V56.8568C0.785674 59.5053 1.65826 62.0811 3.26913 64.1882C4.88076 66.2952 7.1413 67.8184 9.70545 68.5233C10.6058 68.7312 11.4113 69.2308 11.9957 69.9438C12.5801 70.6567 12.9103 71.5432 12.9348 72.4627V75.3503C12.932 76.4265 13.3612 77.4594 14.128 78.2184C14.8942 78.9779 15.9335 79.3999 17.0143 79.3911C18.0815 79.3911 19.1033 78.9624 19.8484 78.2022L27.9486 70.1362C28.7079 69.3794 29.7384 68.9554 30.8125 68.9554H53.4356C56.6574 68.9554 59.7478 67.6807 62.0266 65.4115C64.3054 63.1431 65.5854 60.0657 65.5854 56.8568V52.8242L65.5849 51.8912C65.5849 51.3912 65.5854 50.2702 65.5854 50.2702L65.5849 48.8534ZM61.5345 56.8568C61.5324 58.995 60.6781 61.0453 59.1593 62.5576C57.6413 64.0693 55.5822 64.92 53.435 64.9228H30.8119C28.6626 64.9167 26.6001 65.7674 25.0841 67.2851L16.9839 75.3511V72.4635C16.9656 70.6589 16.3473 68.9101 15.2244 67.493C14.101 66.0766 12.5376 65.0712 10.7788 64.6345C9.0709 64.1625 7.56566 63.1465 6.49248 61.7415C5.41919 60.3372 4.83678 58.6217 4.83475 56.8568V36.6919C4.83678 34.5537 5.69107 32.5034 7.20988 30.9917C8.72794 29.4794 10.787 28.6287 12.9342 28.6266H53.435C55.5823 28.6287 57.6413 29.4793 59.1594 30.9917C60.6781 32.5034 61.5324 34.5537 61.5345 36.6919L61.5345 56.8568ZM25.0848 46.7749C25.0848 48.379 24.4447 49.9177 23.3057 51.0519C22.1666 52.1868 20.6214 52.8242 19.0098 52.8242C17.3989 52.8242 15.8536 52.1868 14.7147 51.0519C13.5749 49.9176 12.9349 48.379 12.9349 46.7749C12.9349 45.17 13.5749 43.6313 14.7147 42.4971C15.8537 41.3629 17.3989 40.7256 19.0098 40.7256C20.6215 40.7256 22.1667 41.3629 23.3057 42.4971C24.4447 43.6314 25.0848 45.1701 25.0848 46.7749ZM53.434 46.7749C53.434 48.379 52.7946 49.9177 51.6549 51.0519C50.5158 52.1868 48.9706 52.8242 47.3597 52.8242C45.7481 52.8242 44.2028 52.1868 43.0638 51.0519C41.9248 49.9176 41.2847 48.379 41.2847 46.7749C41.2847 45.17 41.9248 43.6313 43.0638 42.4971C44.2029 41.363 45.7481 40.7256 47.3597 40.7256C48.9706 40.7256 50.5159 41.3629 51.6549 42.4971C52.7946 43.6314 53.434 45.1701 53.434 46.7749Z" fill="white"/>
    <path d="M33.3058 25.3239L33.1899 25.3912L33.1203 25.3492C11.1568 12.5732 18.6944 0.24375 26.847 0.392569C27.1078 0.392569 27.3718 0.417819 27.6326 0.448745C30.9143 0.833165 32.4595 2.59535 33.19 4.11051C33.9176 2.59535 35.4658 0.83317 38.7474 0.462624C47.1516 -0.539127 55.9042 12.1442 33.306 25.324L33.3058 25.3239Z" fill="white"/>
    </svg>`;
    let divNew = document.createElement("div");
    divNew.innerHTML = svg;
    button.appendChild(divNew);
    button.innerHTML += 'Suggest Reply';
    button.style.lineHeight = '24px';
    button.style.display = 'flex';
    button.style.gap = '7px';
    button.style.height = '34px';
    button.style.color = '#ffffff';
    button.style.border = '1px solid #000';
    button.style.padding = '4px 10px 7px 7px';
    button.style.margin = '0px 6px 0px 0px';
    button.style.background = '#0074eb';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '5px';
    button.style.fontSize = '14px';

    

    // create a random button variable
    let buttonId = Math.floor(Math.random() * 10000);

    button.setAttribute('id', 'suggestPost ' + buttonId);

    // Find the correct div element and append the new button
    const div = document.querySelector('.b-make-post__actions');
    //console.log('div: ', div);
    //console.log('button', button);


    var buttonExists = div.querySelector("[id^='suggestPost']");
    if (!buttonExists) {
        div.insertBefore(button, div.querySelector('.g-btn.m-rounded.b-chat__btn-submit'));
    }





    /////// LISTENER ///////
    // Add listener to execute getCommentsConvo on click
    button.addEventListener('click', function () {
        // const convo = getMessages(parentDiv);
        // //console.log('convo: ', convo);

        // // Disable button and wait for response
        // disableButton(parentDiv, buttonId);

        // actionAPI(convo, parentDiv, buttonId);
        disableButton(parentDiv, buttonId, 'messages');
        Promise.resolve(getMessages(parentDiv))
            .then(convo => {
                
                //console.log('convo: ', convo);
                //console.log('TIME TO ACTION API');

                actionAPI(convo, parentDiv, buttonId, 'messages');
            })


    });
}


// COMMENTS: create button function
function createButton(parentDiv) {
    // Create the new button element
    var button = document.createElement('a');
    let svg = `<svg width="18" height="24" viewBox="0 0 66 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M65.5849 48.8534C65.5849 48.8534 65.5854 47.3912 65.5854 46.3912C65.5854 44.8912 65.5854 44.3912 65.5854 43.3912C65.5854 42.3912 65.5849 40.7256 65.5849 40.7256V36.6922C65.5849 33.484 64.3048 30.4067 62.026 28.1375C59.7472 25.8683 56.6568 24.5936 53.435 24.5936H37.2347V19.4422C39.3087 18.2499 40.746 16.2055 41.1617 13.8575C41.5773 11.51 40.9292 9.09914 39.3901 7.27278C37.851 5.44658 35.579 4.39124 33.1849 4.39124C30.7909 4.39124 28.5189 5.44649 26.9798 7.27278C25.4408 9.09897 24.7925 11.51 25.2082 13.8575C25.6238 16.2057 27.0612 18.25 29.1352 19.4422V24.5936H12.9349C9.71309 24.5936 6.62267 25.8683 4.34387 28.1375C2.06507 30.4067 0.784996 33.484 0.784996 36.6922V40.7249V41.6328L0.784943 43.0874L0.784954 46.3817C0.784954 46.3817 0.911266 49.3124 0.784961 49.4621L0.784996 52.8241V56.8568C0.785674 59.5053 1.65826 62.0811 3.26913 64.1882C4.88076 66.2952 7.1413 67.8184 9.70545 68.5233C10.6058 68.7312 11.4113 69.2308 11.9957 69.9438C12.5801 70.6567 12.9103 71.5432 12.9348 72.4627V75.3503C12.932 76.4265 13.3612 77.4594 14.128 78.2184C14.8942 78.9779 15.9335 79.3999 17.0143 79.3911C18.0815 79.3911 19.1033 78.9624 19.8484 78.2022L27.9486 70.1362C28.7079 69.3794 29.7384 68.9554 30.8125 68.9554H53.4356C56.6574 68.9554 59.7478 67.6807 62.0266 65.4115C64.3054 63.1431 65.5854 60.0657 65.5854 56.8568V52.8242L65.5849 51.8912C65.5849 51.3912 65.5854 50.2702 65.5854 50.2702L65.5849 48.8534ZM61.5345 56.8568C61.5324 58.995 60.6781 61.0453 59.1593 62.5576C57.6413 64.0693 55.5822 64.92 53.435 64.9228H30.8119C28.6626 64.9167 26.6001 65.7674 25.0841 67.2851L16.9839 75.3511V72.4635C16.9656 70.6589 16.3473 68.9101 15.2244 67.493C14.101 66.0766 12.5376 65.0712 10.7788 64.6345C9.0709 64.1625 7.56566 63.1465 6.49248 61.7415C5.41919 60.3372 4.83678 58.6217 4.83475 56.8568V36.6919C4.83678 34.5537 5.69107 32.5034 7.20988 30.9917C8.72794 29.4794 10.787 28.6287 12.9342 28.6266H53.435C55.5823 28.6287 57.6413 29.4793 59.1594 30.9917C60.6781 32.5034 61.5324 34.5537 61.5345 36.6919L61.5345 56.8568ZM25.0848 46.7749C25.0848 48.379 24.4447 49.9177 23.3057 51.0519C22.1666 52.1868 20.6214 52.8242 19.0098 52.8242C17.3989 52.8242 15.8536 52.1868 14.7147 51.0519C13.5749 49.9176 12.9349 48.379 12.9349 46.7749C12.9349 45.17 13.5749 43.6313 14.7147 42.4971C15.8537 41.3629 17.3989 40.7256 19.0098 40.7256C20.6215 40.7256 22.1667 41.3629 23.3057 42.4971C24.4447 43.6314 25.0848 45.1701 25.0848 46.7749ZM53.434 46.7749C53.434 48.379 52.7946 49.9177 51.6549 51.0519C50.5158 52.1868 48.9706 52.8242 47.3597 52.8242C45.7481 52.8242 44.2028 52.1868 43.0638 51.0519C41.9248 49.9176 41.2847 48.379 41.2847 46.7749C41.2847 45.17 41.9248 43.6313 43.0638 42.4971C44.2029 41.363 45.7481 40.7256 47.3597 40.7256C48.9706 40.7256 50.5159 41.3629 51.6549 42.4971C52.7946 43.6314 53.434 45.1701 53.434 46.7749Z" fill="white"/>
    <path d="M33.3058 25.3239L33.1899 25.3912L33.1203 25.3492C11.1568 12.5732 18.6944 0.24375 26.847 0.392569C27.1078 0.392569 27.3718 0.417819 27.6326 0.448745C30.9143 0.833165 32.4595 2.59535 33.19 4.11051C33.9176 2.59535 35.4658 0.83317 38.7474 0.462624C47.1516 -0.539127 55.9042 12.1442 33.306 25.324L33.3058 25.3239Z" fill="white"/>
    </svg>`;
    let divNew = document.createElement("div");
    divNew.innerHTML = svg;
    button.appendChild(divNew);
    button.innerHTML += 'Suggest Reply';
    button.style.lineHeight = '24px';
    button.style.display = 'flex';
    button.style.gap = '7px';
    button.style.height = '34px';
    button.style.color = '#ffffff';
    button.style.border = '1px solid #000';
    button.style.padding = '4px 10px 7px 7px';
    button.style.margin = '7px 0px 0px 0px';
    button.style.background = '#0074eb';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '5px';
    button.style.fontSize = '14px';

    // create a random button variable
    let buttonId = Math.floor(Math.random() * 10000);

    button.setAttribute('id', 'suggestPost ' + buttonId);

    // Find the correct div element and append the new button
    const div = parentDiv.querySelector('.v-input__slot');

    // Check if button already exists inside the parent div. If it does, don't create a new one.
    // Required because mutation observer may trigger this function multiple times.
    var buttonExists = parentDiv.querySelector("[id^='suggestPost']");
    if (!buttonExists) {
        div.insertBefore(button, div.querySelector('v-text-field__slot'));
    }

    /////// LISTENER ///////
    // Add listener to execute getCommentsConvo on click
    button.addEventListener('click', function () {
        disableButton(parentDiv, buttonId, 'comments');
        const convo = getCommentsConvo(parentDiv);
        //console.log('convo: ', convo);

        // Disable button and wait for response


        actionAPI(convo, parentDiv, buttonId, 'comments');

    });
}

// function to cut incomplete sentences. Leave only sentence with ending punctuatino or emoji.
function cutOffIncompleteSentence(text) {
    // Split the text into an array of characters
    const chars = text.split('');

    // Check if the last character of the text is not a punctuation character or an emoji
    if (['.', '!', '?'].indexOf(chars[chars.length - 1]) === -1 && (chars.length < 2 || !(chars[chars.length - 2] >= '\uD800' && chars[chars.length - 2] <= '\uDBFF' && chars[chars.length - 1] >= '\uDC00' && chars[chars.length - 1] <= '\uDFFF'))) {
        // If it is not, then loop through the characters in reverse order
        for (let i = chars.length - 1; i >= 0; i--) {
            // Check if the character is a punctuation character or an emoji (part of a surrogate pair)
            if (['.', '!', '?'].indexOf(chars[i]) !== -1 || (i > 0 && chars[i - 1] >= '\uD800' && chars[i - 1] <= '\uDBFF' && chars[i] >= '\uDC00' && chars[i] <= '\uDFFF')) {
                // If it is, then return the text up to that point
                return chars.slice(0, i + 1).join('');
            }
        }
    }

    // If the last character is a punctuation character or no punctuation character was found, return the original text
    return text;
}


// Populate Messages textarea with response
function populateResponseTriggerMessages(text, parentDiv, buttonId, status) {
    //console.log('text populate:', text);
    function injectTextIntoTextareaMessages(textarea, text) {
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

        if (status === false) {
            textarea.style.color = 'red';
        } else {
            textarea.style.color = 'black';
        }
    }

    // Inject text into textarea
    var textarea = document.getElementById('new_post_text_input');
    injectTextIntoTextareaMessages(textarea, text);
    enableButton(parentDiv, buttonId, 'messages');

}


// Populate Comments textarea with response
function populateResponseTrigger(text, parentDiv, buttonId, status) {

    function injectTextIntoTextarea(textarea, text) {

        //console.log('injectTextIntoTextarea TEXT: ', text);
        //console.log('injectTextIntoTextarea textarea: ', textarea);
        // Inject text into textarea

        // //console.log('textarea', textarea);

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
        //console.log('textEvent', textEvent);

        // Create a new custom event
        var inputEvent = document.createEvent('Event');
        inputEvent.initEvent('input', true, true);
        inputEvent.data = text;
        inputEvent.inputType = 'insertText';
        inputEvent.isComposing = false;
        inputEvent.isTrusted = true;

        // Dispatch the custom event
        textarea.dispatchEvent(inputEvent);

        if (status === false) {
            textarea.style.color = 'red';
        } else {
            textarea.style.color = 'black';
        }


        //console.log('inputEvent', inputEvent);

    }
    var textarea = parentDiv.querySelector('.v-text-field__slot textarea');
    injectTextIntoTextarea(textarea, text);
    enableButton(parentDiv, buttonId, 'comments');

}

function actionAPI(convo, parentDiv, buttonId, type) {
    //console.log('actionAPI', convo);
    //console.log('actionAPI parentDiv', parentDiv);
    //Get User ID
    async function getUserId() {
        try {
            const response = await chrome.runtime.sendMessage({ command: "checkAuth" });
            if (response.status === "success") {
                return response.message.uid;
            } else {
                return "invaliduser";
                // throw new Error("Failed to get user ID");
            }
        } catch (error) {
            throw error;
        }
    }

    getUserId().then((userId) => {
        //console.log('userId: ', userId);

        // check if user exists
        if (userId === "invaliduser") {
            // Not logged in. Show error.
            populateResponseTrigger("ERROR: Log in to chrome extension to get suggestions.", parentDiv, buttonId, false);
            
            if (type === 'comments') {
                enableButton(parentDiv, buttonId, 'comments');
            } else {
                enableButton(parentDiv, buttonId, 'messages');
            }
        } else {
            // Action API Post

            var data = {
                "convo": convo,
                "trigger": "content",
                user: userId
            };

            chrome.runtime.sendMessage({
                type: "postAPI",
                data: data
            }, (response) => {
                //console.log('response data: ', response.data);
                let oresponse = response.data.replace(/\n/g, "");
                let oresponseStatus = response.status;
                //console.log('oresponse: ', oresponse);
                oresponse = cutOffIncompleteSentence(oresponse);
                // clean response of Person A string and any characters before it
                //console.log('oresponse cut: ', oresponse);
                var regex = /.*Person A:|.*A:|^[^a-zA-Z]+/;
                var regex1 = /.* A:/;
                var regex2 = /Person[ ]?B/;
        
                oresponse = oresponse.replace(regex, "");
                oresponse = oresponse.replace(regex1, "");
                oresponse = oresponse.replace(regex2, "");
                oresponse = oresponse.trimStart();
                //console.log('oresponse cut 2: ', oresponse);

                if (type === 'comments') {
                    populateResponseTrigger(oresponse, parentDiv, buttonId);
                } else if (type === 'messages') {
                    populateResponseTriggerMessages(oresponse, parentDiv, buttonId);
                }
            });


        }


    });

}
//////////////////////////////
//////// ON PAGE LOAD ////////
//////////////////////////////
// Functiion on page load timeout. Render components.
setTimeout(function () {
    //console.log('START');

    // Get all posts on profile page

    const bPostTools = document.querySelectorAll('.b-post__tools__item');
    bPostTools.forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.send-comment-btn')) {
                const activeButton = document.querySelector('.send-comment-btn.m-active');
                setTimeout(function () {
                    if (activeButton) {
                        const parentDiv = e.target.closest('.dynamic-scroller-item-profile-feed');
                        createButton(parentDiv);
                    }
                }, 1000); // Wait 1 second for the div to be updated to m-active. If you dont wait on second click you get error because class is removed after function is triggered.
            }
        });
    });


    // Implement suggest button on individual post page
    // Listen for page title changes and inject button on pages that resemble individual posts page.
    const config = { attributes: true, childList: true, subtree: true };

    let currentTitle;
    const pageTitle = document.querySelector('title');

    const callback = (mutationList, observer) => {
        mutationList.forEach((mutation) => {
            if (mutation.target.localName === 'title' && currentTitle !== mutation.target.innerText) {
                currentTitle = mutation.target.innerText;
                const currentUrl = window.location.href;
                //console.log("current url ", currentUrl);
                // check for individual post url pattern
                if (currentUrl.match(/^https:\/\/onlyfans\.com\/\d+\/\w+/) && !currentUrl.match(/^https:\/\/onlyfans\.com\/my\/chats\/chat\/.+/)) {
                    // code to execute if the URL matches the pattern
                    //console.log("post page");
                    const postPage = document.querySelector('.g-page-content');
                    //console.log('postPage', postPage);
                    // createButton(postPage);
                    if (postPage) {
                        const parentDiv = document.querySelector('.g-page-content');
                        createButton(parentDiv);
                    }
                    // check for my profile url pattern
                } else if (currentUrl.match(/^https:\/\/onlyfans\.com\/[a-zA-Z0-9_]+/)) {
                    //console.log('profile page!!!!!!!');


                    setTimeout(function () {
                        const divPostTools = document.querySelectorAll('.b-post__tools__item');
                        //console.log('divPostTools', divPostTools);
                        //console.log('pageTitle1', pageTitle);
                        divPostTools.forEach(el => {
                            el.addEventListener('click', (e) => {
                                if (e.target.closest('.send-comment-btn')) {
                                    const activeButtonNew = document.querySelector('.send-comment-btn.m-active');
                                    if (activeButtonNew) {
                                        const parentDivNew = e.target.closest('.dynamic-scroller-item-profile-feed');
                                        //console.log('pageTitle', pageTitle);
                                        createButton(parentDivNew);



                                    }
                                }
                            });
                        });
                    }, 3000);


                } else if (currentUrl.match(/^https:\/\/onlyfans\.com\/my\/chats\/chat\/.+/)) {
                    // Enable only fans send button which by default is blocked from being clicked
                    var postButton = document.querySelector(".g-btn.m-rounded.b-chat__btn-submit");
                    if (postButton.hasAttribute("disabled")) {
                        postButton.removeAttribute("disabled");
                    }
                    const messagePage = document.querySelector('.b-make-post__actions');
                    //console.log('messagePage', messagePage);
                    if (messagePage) {
                        const parentDiv = document.querySelector('.b-make-post__actions');

                        createButton(parentDiv);
                    }

                }

            }
        });

    };

    const observer = new MutationObserver(callback);
    observer.observe(pageTitle, config);



    // NEW MUTATION OBSERVER
    // A solution to watch user navigating to individual message pages
    // Mutation observer to watch for child elements being added to the document with specific class
    const targetNode = document.body;
    const configMessages = { attributes: true, childList: true, subtree: true };

    const callbackMessages = function (mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    // //console.log('node', node.classList);
                    setTimeout(function () {
                        if (node.nodeName === 'DIV' && node.classList.contains('b-chat__item-message')) {
                            // Enable only fans send button which by default is blocked from being clicked
                            var postButton = document.querySelector(".g-btn.m-rounded.b-chat__btn-submit");
                            if (postButton.hasAttribute("disabled")) {
                                postButton.removeAttribute("disabled");
                            }
                            const messagePage = document.querySelector('.b-make-post__actions');
                            //console.log('messagePage!!!!!!', messagePage);
                            if (messagePage) {
                                const parentDiv = document.querySelector('.b-make-post__actions');

                                createButtonMessages(parentDiv);
                            }

                        }
                    }, 2000);
                });
            }
        }
    };

    const observerMessages = new MutationObserver(callbackMessages);
    observerMessages.observe(targetNode, configMessages);



    /////
    // On page load, retrieve title and check if it matches the condition
    const currentUrlRefresh = window.location.href;

    if (currentUrlRefresh.match(/^https:\/\/onlyfans\.com\/\d+\/\w+/)) {
        //console.log("post page");
        const postPage = document.querySelector('.g-page-content');
        //console.log('postPage', postPage);
        if (postPage) {
            const parentDiv = document.querySelector('.g-page-content');
            createButton(parentDiv);
        }
    } else if (currentUrlRefresh.match(/^https:\/\/onlyfans\.com\/my\/chats\/chat\/.+/)) {
        setTimeout(function () {
            var postButton = document.querySelector(".g-btn.m-rounded.b-chat__btn-submit");
            if (postButton.hasAttribute("disabled")) {
                postButton.removeAttribute("disabled");
            }
            const messagePage = document.querySelector('.b-make-post__actions');
            //console.log('messagePage', messagePage);

            if (messagePage) {
                const parentDiv = document.querySelector('.b-make-post__actions');
                createButtonMessages(parentDiv);
            }
        }, 3000);
    }






}, 3000);










