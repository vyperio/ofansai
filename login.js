//JS loads on index page only.

// On main page get user state, the last page they were on. If it exists redirect to that page
// Check if user clicked back on any of the pages wit ?state=reset. If they did, reset state to empty in local storage. User should be back on index page when re-open extension.

// Check for ?reset=state in url
const urlParams = new URLSearchParams(window.location.search);
const state = urlParams.get("state");
// Check if it exists
if (state === "reset") {
  // It exists. Overwrite state to index page
  chrome.runtime.sendMessage(
    { command: "setUserState", data: "" },
    (response) => { }
  );
} else {
  // Doesn't exist. Check if state exists in local-storage.

  (async () => {
    const response = await chrome.runtime.sendMessage({
      command: "getUserState",
    });

    const user = await chrome.runtime.sendMessage({
      command: "checkAuth",
    });

    // do something with response here, not outside the function
    let stateURL = await response?.message;
    // //console.log("🚀 ~ file: login.js:32 ~ stateURL", stateURL, user.status);

    if (stateURL?.includes("index.html") && user?.status === "no-auth") {
      document.querySelector(".logout-btn-auth").style.display = "none";
      // document.querySelector(".app-btn-suggest").style.display = "none";
      // document.querySelector(".app-btn-settings").style.display = "none";
      // document.querySelector(".user-details").style.display = "none";
    }
    if (!stateURL || stateURL === "") {
      //console.log("State URL shouldn't exist", stateURL);
      return;
      // Doesn't exist. Do nothing
    } else if (stateURL.includes("index.html")) {
      return;
    } else if (!stateURL.includes("index.html") && user.status !== "no-auth") {
      window.location.replace(stateURL);
    }
  })();
}

//
// &&

//Check if user logged in using chrome runtime message
(async () => {
  const response = await chrome.runtime.sendMessage({ command: "checkAuth" });
  // do something with response here, not outside the function.

  if (response?.status === "success") {
    renderUserDetails(response);
    document.querySelector(".loggedInArea").style.display = "block";
    document.querySelector(".loginArea").style.display = "none";
    document.querySelector(".loggedInArea .user-details #userEmail span").innerHTML = response?.message.email;
    // document.querySelector(".loggedInArea .user-id span").innerHTML = response?.message.uid;
  } else {

    document.querySelector(".logout-btn-auth").style.display = "none";
    document.querySelector(".loginArea").style.display = "block";
  }
})();

// Login form

const loginFunc = async function () {
  //console.log("loginFunc called");
  const e = document.querySelector('.loginArea input[type="email"]').value;
  const p = document.querySelector('.loginArea input[type="password"]').value;
  //console.log(e);

  //console.log(p);

  const response = await chrome.runtime.sendMessage({
    command: "loginUser",
    data: { e: e, p: p },
  });

  try {
    document.querySelector(".loginArea").style.display = "none";
    document.querySelector(".loggedInArea").style.display = "none";
    if (response.status === "success") {
      renderUserDetails(response);
      document.querySelector(".loggedInArea").style.display = "block";
      document.querySelector(".logout-btn-auth").style.display = "block";

      document.querySelector(".loggedInArea .user-details #userEmail span").innerHTML = response?.message.email;
      // document.querySelector(".loggedInArea .user_id span").innerHTML = response.message.uid;
    } else {
      document.querySelector(".loginArea").style.display = "block";
      document.querySelector(".loginArea .error").style.display = "block";
      //console.log("error login");
    }
  } catch (error) {
    console.error({ error });
  }
};

/**
 * Render User info coming from firestore.
 * @param {User} response
 */
const renderUserDetails = async (response) => {
  let userID = response.message.uid;

  (async () => {
    const { status, message } = await chrome.runtime.sendMessage({
      command: "getPlan",
      userID: userID,
    });

    //console.log({ status, message });
    if (status === "unpaid") {
      document.querySelector("#user_payment span").innerHTML = "false";
    }

    if (status === "success") {
      document.querySelector("#user_payment span").innerHTML = message?.role
        ? "true"
        : "false";
      document.querySelector("#user_plan_type span").innerHTML = message?.role
        ? message?.role
        : "error";
    }
  })();

  (async () => {
    const { status, message } = await chrome.runtime.sendMessage({
      command: "getCredits",
      userID: userID,
    });
    if (status === "success") {
      const { creditsBonus, creditsTotal, creditsUsed, planName } = message;
      {
        document.querySelector("#user_credit_Bonus span").innerHTML =
          creditsBonus;
        document.querySelector("#user_credit_Total span").innerHTML =
          creditsTotal;
        document.querySelector("#user_credit_Used span").innerHTML =
          creditsUsed;
        document.querySelector("#user_Plan_Name span").innerHTML = planName;
        let remainingCredits = creditsTotal - creditsUsed + creditsBonus;
        document.querySelector("#user_credits_available span").innerHTML = remainingCredits;
      }
    } else if (status === "error") {
      document.querySelector("#user_credits_available span").innerHTML = "0<br> Visit <strong>ofans.ai</strong> to activate a plan.";
    }
    

  })();

  // Get Update Message when user is logged in



  (async () => {
    const updates = await chrome.runtime.sendMessage({ command: "getUpdates" });

    if (updates.status === "success") {
      document.querySelector('.updates').style.display = 'block';
      const message = updates.message.text;
      const link = updates.message.link;
      const updatesDiv = document.querySelector('.updates span');
      updatesDiv.innerHTML = message;
      const timestamp = updates.message.createdAt.seconds;
      const updatesDivLink = document.querySelector('.updates a');
      updatesDivLink.id = timestamp;
      updatesDivLink.href = link;
      // //console.log('seconds',timestamp);
      // //console.log('text',message);

      let updatesBtn = document.getElementById(timestamp);
      if (updatesBtn) {
        updatesBtn.addEventListener("click", function () {
          chrome.tabs.create({ url: link });
        });
      }

    } else {
      //console.log('error', updates);
      document.querySelector('.updates').style.display = 'none';
    }
  })();


};

// Add an event listener for the login button
document
  .querySelector(".login-btn-auth")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    loginFunc();
  });

document
  .querySelector(".logout-btn-auth")
  .addEventListener("click", function () {
    logoutFunc();
  });

var logoutFunc = function () {
  chrome.runtime.sendMessage({ command: "logoutAuth" }, (response) => {
    // Process the response from the Chrome runtime
    //console.log("Received response from Chrome runtime:", response);
    // Hide the logged in area and show the login form again
    document.querySelector(".loggedInArea").style.display = "none";
    document.querySelector(".loginArea").style.display = "block";

  });
  window.location.reload();
};

