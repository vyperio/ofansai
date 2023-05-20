

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // PostAPI Listener
  if (request.type === "postAPI") {
    // Make the API call using the data from the request object
    makeAPICall(request.data).then((response) => {
      sendResponse({
        status: response.status,
        data: response.data
      });

    }).catch(function (error) {
      // console.error(error);
      sendResponse({
        status: "error"
      });

    });

  }
  return true; // Required to use sendResponse asynchronously
});


async function makeAPICall(data) {
  // Make the API call and return a promise
  return new Promise(async function (resolve, reject) {
    try {
      const response = await fetch('https://us-central1-ofansai.cloudfunctions.net/aiReply', {
      // const response = await fetch('http://localhost:8080', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });


      const res = await response.json();

      resolve(res);

    } catch (error) {
      //console.log(error);
      reject(error);
    }

  });

}


// Firebase Import


self.importScripts(
  "src/firebase-app.js",
  "src/firebase-auth.js",
  "src/firebase-firestore.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBZe8jmUPBvrM_iqw_QzeYuikmV0nAsrZk",
  authDomain: "ofansai.firebaseapp.com",
  projectId: "ofansai",
  storageBucket: "ofansai.appspot.com",
  messagingSenderId: "147311389178",
  appId: "1:147311389178:web:9e92e73c761a3cf1939c43",
  measurementId: "G-KD0NBG0B1P"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// const timestamp_database = firebase.default.firestore.FieldValue.serverTimestamp();


chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.command == "logoutAuth") {
    firebase
      .auth()
      .signOut()
      .then(function () {
        //sign-out successful
        //console.log("Sign-out successful.");
        response({ type: "auth", status: "success", message: true });
      })
      .catch((error) => {
        // an error occuered
        //console.log("An error happened.");
        response({ type: "auth", status: "error", message: false });
      });
  }

  if (msg.command == "checkAuth") {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        //console.log("Auth User is signed in.");
        response({ type: "auth", status: "success", message: user });
      } else {
        // No user signed in
        //console.log("Auth User is not signed in.");
        response({ type: "auth", status: "no-auth", message: false });
      }
    });
  }

  if (msg.command == "loginUser") {
    //console.log(msg.data);
    //console.log("Login User");
    var email = msg.data.e;
    var password = msg.data.p;
    // Add separate values for auth info here instead of fixed variables.
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((user) => {
        response({ type: "auth", status: "success", message: user.user });
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        //console.log("🚀 errorCode", errorCode);

        response({ type: "auth", status: "error", message: errorCode });
        // ...
      });
  }

  // Function to set user state in local storage
  if (msg.command == "setUserState") {
    currentURL = msg.data;
    chrome.storage.local.set({ currentUrl: currentURL }).then(() => {
      chrome.storage.session.get(["currentUrl"]).then((result) => {
        response({
          type: "getUserState",
          status: "success",
          message: result.currentUrl,
        });
      });
    });
  }
  // Function to get user state from local storage
  if (msg.command == "getUserState") {
    chrome.storage.local.get(["currentUrl"]).then((result) => {
      response({
        type: "getUserState",
        status: "success",
        message: result.currentUrl,
      });
    });
  }
  // Function to store temp response in local storage
  if (msg.command == "setTempResponse") {
    oresponse = msg.data;
    chrome.storage.local.set({ tempResponse: oresponse }).then(() => {
      chrome.storage.session.get(["tempResponse"]).then((result) => {
        response({
          type: "getTempResponse",
          status: "success",
          message: result.tempResponse,
        });
      });
    });
  }
  // Function to get temp response from local storage
  if (msg.command == "getTempResponse") {
    chrome.storage.local.get(["tempResponse"]).then((result) => {
      response({
        type: "getTempResponse",
        status: "success",
        message: result.tempResponse,
      });
    });
  }
  // Function to get Active User plan
  if (msg.command === "getPlan") {
    db.collection("users")
      .doc(msg.userID)
      .collection("subscriptions")
      .where("status", "in", ["trialing", "active"])
      .where("canceled_at", "==", null)
      .where("trial_end", "==", null)
      .get()
      .then((subscriptionSnapshot) => {
        if (subscriptionSnapshot.empty) {

          db.collection("users")
            .doc(msg.userID)
            .collection("payments")
            .orderBy("created", "desc")
            .limit(1)
            .get()
            .then((latestPayment) => {
              if (latestPayment.empty) {

                response({ status: "unpaid", message: false });
                return;
              }
              else {
                const data = latestPayment.docs[0].data();

                if (data.charges && data.charges.data) {
                  const chargesData = data.charges.data;
                  const isPaid = chargesData.some(function (data) {
                    return data.paid === true;
                  });
                  if (isPaid) {
                    // const doc = subscriptionSnapshot.docs.shift();
                    // const sub = doc.data();
                    // response({ status: "success", message: sub });
                    response({ status: "success", message: "agency" });
                  }
                  else response({ status: "unpaid", message: false });
                }
                else response({ status: "unpaid", message: false });
              }
            });
        } else {

          const doc = subscriptionSnapshot.docs.shift();
          const sub = doc.data();
          response({ status: "success", message: sub });
          return;
        }
      });
  }

  // Function To get Active user Credit Object.
  if (msg.command === "getCredits") {
    db.collection("credits")
      .doc(msg.userID)
      .get()
      .then((snapshot) => {
        const credits = snapshot.data();
        if (snapshot.exists) {
          response({ status: "success", message: credits });
        } else {
          response({ status: "error", message: false });
        }
      });
  }
  // function get settings
  if (msg.command === "getSettings") {
    db.collection("settings")
      .doc(msg.userID)
      .get()
      .then((snapshot) => {
        const settings = snapshot.data();
        if (snapshot.exists) {
          response({ status: "success", message: settings });
        } else {
          response({ status: "error", message: false });
        }
      });
  }

  // function update settings
  if (msg.command === "saveSettings") {
    db.collection("settings").doc(msg.userID).set({
      inputEmoji: msg.data.emoji,
      inputQuestion: msg.data.question,
      inputShort: msg.data.short,
      inputTone: msg.data.tone,
      inputWords: msg.data.words
    }, { merge: true }).then(() => {
      response({ status: "success", message: true });
    }).catch(error => {
      response({ status: "error", message: error });
    });
  }

  // function update settings
  if (msg.command === "resetSettings") {
    db.collection("settings").doc(msg.userID).set({
      inputEmoji: false,
      inputQuestion: "",
      inputShort: false,
      inputTone: "Friendly",
      inputWords: ""
    }, { merge: true }).then(() => {
      response({ status: "success", message: true });
    }).catch(error => {
      response({ status: "error", message: error });
    });
  }

  // Function To get Active user Credit Object.
  if (msg.command === "getUpdates") {


    //firebase.default.firestore.FieldValue.serverTimestamp()
    let twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); //subtract 14 days
    let twoWeeksAgoTimestamp = firebase.default.firestore.Timestamp.fromDate(twoWeeksAgo);

    db.collection("updates")
      .where("createdAt", ">", twoWeeksAgoTimestamp)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get()
      .then((updates) => {

        if (updates.empty) {
          response({ status: "error", message: false });

        } else {
          let updatesNew = updates.docs[0].data();
          response({ status: "success", message: updatesNew });
        }
      });
  }

  return true;
});
