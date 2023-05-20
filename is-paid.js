// Handle auth on other pages
chrome.runtime.sendMessage({ command: "checkAuth" }, (response) => {
  if (response.status === "success") {
    const userID = response.message.uid;
    (async () => {
      const { status } = await chrome.runtime.sendMessage({
        command: "getPlan",
        userID: userID,
      });

      if (status === "unpaid") {
        window.location.replace("index.html?state=reset");
      }
    })();
  }
});
