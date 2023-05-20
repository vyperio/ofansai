

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
getUserId().then((userId) => {

    (async () => {
        const savedSettings = await chrome.runtime.sendMessage({
            command: "getSettings",
            userID: userId
        });
        // do something with response here, not outside the function.

        if (savedSettings?.status === "success") {
            //console.log(savedSettings);

            // Get Form data and pass to func
            let inputWords = document.getElementById('input-words');
            let inputTone = document.getElementById('input-tone');
            let inputQuestion = document.getElementById('input-question');
            let inputEmoji = document.getElementById('input-emoji');
            let inputShort = document.getElementById('input-short');

            inputWords.value = savedSettings.message.inputWords;
            inputTone.value = savedSettings.message.inputTone;
            inputQuestion.value = savedSettings.message.inputQuestion;
            inputEmoji.checked = savedSettings.message.inputEmoji;
            inputShort.checked = savedSettings.message.inputShort;

        } else {
            //console.log("ERROR", savedSettings);
        }
    })();

    // load settings

    // On button click Generate action run func
    document.getElementById("button").onclick = () => {
        //console.log("save settings");

        // Disable button to prevent multiple clicks
        var button = document.getElementById("button");
        button.disabled = true;
        button.textContent = 'Saving...';

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

        var data = {
            "tone": responseTone,
            "words": responseWords,
            "question": responseQuestion,
            "emoji": responseEmoji,
            "short": responseShort
        };

        // Get user ID and execute save settings


        (async () => {
            const response = await chrome.runtime.sendMessage({
                command: "saveSettings",
                userID: userId,
                data: data
            });
            // do something with response here, not outside the function.

            if (response?.status === "success") {
                //console.log(response);
                var button = document.getElementById("button");
                button.disabled = false;
                button.textContent = 'Save';

                let res = document.getElementById("responses");
                res.innerHTML = "Settings Saved";

            } else {
                //console.log("ERROR", response);
            }
        })();






    }
    // on click of reset event reset firestore settings
    document.getElementById("button-reset").onclick = () => {
        //console.log("reset settings");


        (async () => {
            const response = await chrome.runtime.sendMessage({
                command: "resetSettings",
                userID: userId
            });
            // do something with response here, not outside the function.

            if (response?.status === "success") {
                //console.log(response);

                let res = document.getElementById("responses");
                res.innerHTML = "Settings Reset";

                // Get Form data and pass to func
                let inputWords = document.getElementById('input-words');
                let inputTone = document.getElementById('input-tone');
                let inputQuestion = document.getElementById('input-question');
                let inputEmoji = document.getElementById('input-emoji');
                let inputShort = document.getElementById('input-short');

                inputWords.value = "";
                inputTone.value = "Friendly";
                inputQuestion.value = "";
                inputEmoji.checked = false;
                inputShort.checked = false;

            } else {
                //console.log("ERROR", response);
            }
        })();

    }

}).catch((error) => { 
    //console.log(error)
});


