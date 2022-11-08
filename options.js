function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        waittime: document.querySelector("#waittime").value,
        urls: document.querySelector("#urls").value
    });
  }
  
  function restoreOptions() {
    function setCurrentURLs(result) {
        document.querySelector("#urls").value = result.urls || "";
    }
    function setCurrentWaittime(result) {
        document.querySelector("#waittime").value = result.waittime || "5000";
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("urls");
    getting.then(setCurrentURLs, onError);
    let gettingWaittime = browser.storage.sync.get("waittime");
    gettingWaittime.then(setCurrentWaittime, onError);
  }
  
  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);

  
