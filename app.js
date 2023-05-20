// Handle auth on other pages
chrome.runtime.sendMessage({ command: "checkAuth" }, (response) => {
  if (response.status === "success") {
    //console.log("User is logged in");


    let userID = response.message.uid;
    //console.log(userID);
    // Add userID into form field
    // Get a reference to the hidden form element
// var hiddenField = document.getElementById('input-userid');

// // Set the value of the hidden field
// hiddenField.value = userID;

    // document.getElementById('input-userid').setAttribute('value', userID);

    (async () => {
      const { status, message } = await chrome.runtime.sendMessage({
        command: "getPlan",
        userID: userID,
      });
      if (status === "unpaid") {
        document.querySelector("#user_payment span").innerHTML = "false";
      }
      if (status === "success") {
        if (!window.location.pathname.includes("index")) {
          document.querySelector("#user_payment span").innerHTML = message?.role
            ? "true"
            : "false";
          document.querySelector("#user_plan_type span").innerHTML =
            message?.role ? message?.role : "error";
        }
      }
    })();
    (async () => {
      const { status, message } = await chrome.runtime.sendMessage({
        command: "getCredits",
        userID: userID,
      });
      if (status === "success") {
        const { creditsBonus, creditsTotal, creditsUsed, planName } = message;
        if (!window.location.pathname.includes("index")) {
          document.querySelector("#user_credit_Bonus span").innerHTML =
            creditsBonus;
          document.querySelector("#user_credit_Total span").innerHTML =
            creditsTotal;
          document.querySelector("#user_credit_Used span").innerHTML =
            creditsUsed;
          document.querySelector("#user_Plan_Name span").innerHTML = planName;

          // get remaining credits available
          let remainingCredits = creditsTotal - creditsUsed + creditsBonus;
          document.querySelector("#user_credits_available span").innerHTML = remainingCredits;
        }
      } else if (status === "error") {
        document.querySelector("#user_credits_available span").innerHTML =  "0<br> Visit <strong>ofans.ai</strong> to activate a plan.";
      }
    })();
  } else {
    // Redirect user to login page.
    let currentURL = window.location.href;
    let newUrl = currentURL.split("/");
    newUrl[newUrl.length - 1] = "index.html";
    let updatedSearch = currentURL.replace(currentURL, newUrl.join("/"));

    if (currentURL.includes("suggestreply") || currentURL.includes("replysettings")) {
      window.location.href = updatedSearch;
      }
  }
});

document
  .querySelector(".logout-btn-auth")
  .addEventListener("click", function () {
    logoutFunc();
  });

var logoutFunc = function () {
  chrome.runtime.sendMessage({ command: "logoutAuth" }, (response) => {});
  window.location.reload();
};


let helpBtn = document.getElementById("help");
if(helpBtn){
    helpBtn.addEventListener("click", function() {
        chrome.tabs.create({url: "https://www.ofans.ai/help"});
    });
}

let webBtn = document.getElementById("web");
if(webBtn){
  webBtn.addEventListener("click", function() {
        chrome.tabs.create({url: "https://www.ofans.ai"});
    });
}





// document.getElementById("help").addEventListener("click", function() {
//   chrome.tabs.create({url: "https://www.ofans.ai/help"});
// });

// document.getElementById("web").addEventListener("click", function() {
//   chrome.tabs.create({url: "https://www.ofans.ai"});
// });

// Update user state localstorage to current page they are on.

// Get current url of page user is on in the extension.
let url = window.location.href;
var currentURL = url;
// //console.log("Default url:", currentURL);
chrome.runtime.sendMessage(
  { command: "setUserState", data: currentURL },
  (response) => {
    // //console.log(response);
  }
);
