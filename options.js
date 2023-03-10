function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    waittime: document.querySelector("#waittime").value,
    timeouttime: document.querySelector("#timeouttime").value,
    transparentbg: document.querySelector("#transparent-bg").checked,
    urls: document.querySelector("#urls").value,
  });
}

function restoreOptions() {
  function setCurrentURLs(result) {
    document.querySelector("#urls").value = result.urls || "";
  }
  function setCurrentWaittime(result) {
    document.querySelector("#waittime").value = result.waittime || "5";
  }
  function setCurrentTimeouttime(result) {
    document.querySelector("#timeouttime").value = result.timeouttime || "600";
  }
  function setCurrentTransparentBG(result) {
    document.querySelector("#transparent-bg").checked =
      result.transparentbg || false;
  }

  function onError(error) {
    console.log(`Slowify-error: ${error}`);
  }

  browser.storage.sync.get("urls").then(setCurrentURLs, onError);
  browser.storage.sync.get("waittime").then(setCurrentWaittime, onError);
  browser.storage.sync.get("timeouttime").then(setCurrentTimeouttime, onError);
  browser.storage.sync
    .get("transparentbg")
    .then(setCurrentTransparentBG, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
