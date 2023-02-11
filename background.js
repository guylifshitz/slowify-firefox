let url_patterns = [];
let time_of_last_doop = 0;
let locked = false;
let isWindowFocused;
let TIMEOUT_TIME_SEC = 60;

// TODO make this blocking
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("listen isWindowFocused", isWindowFocused, sender);
  let cond = sender.tab.active && isWindowFocused;
  if (cond) {
    // setTimeout(function () {
    time_of_last_doop = Date.now();
    console.log("RESET TIMER !!:::2222:!!!!!!!::::::::::!!!!!!!!!!!", sender);
    // }, 250);
  }
});

function sendSignal(tabId) {
  console.log("SENDSIGNAL: ", timeSinceLastDoop());

  let data = { only_timer: false, cancel_timers: false };
  if (timeSinceLastDoop() < TIMEOUT_TIME_SEC * 1000) {
    data = { only_timer: true, cancel_timers: false };
  }

  browser.tabs.sendMessage(tabId, data, function (response) {
    console.log("ResponseSendSignal: ", response);
  });
}
function timeSinceLastDoop() {
  return Date.now() - time_of_last_doop;
}

function cancelTimers(tabId) {
  console.log("cancelTimers");
  let data = { cancel_timer: true };
  browser.tabs.sendMessage(tabId, data, function (response) {
    console.log("ResponseCANCEL: ", response);
  });
}

function handleActivated(activeInfo) {
  console.log(`----V---`);
  console.log(`Tab ${activeInfo.tabId} was activated`);
  console.log(activeInfo);
  console.log(`----^---`);

  cancelTimers(activeInfo.previousTabId);

  function queryResult(tabs) {
    console.log("Active tab: ", tabs[0]);
    if (tabs.length > 0 && activeInfo.tabId === tabs[0].id) {
      sendSignal(tabs[0].id);
    }
  }

  browser.tabs
    .query({ active: true, url: url_patterns })
    .then(queryResult, getSettingValueError);
}

function handleUpdated(tabId, changeInfo, tabInfo) {
  console.log("---V----");
  console.log(`Updated tab: ${tabId}`);
  console.log("Changed attributes: ", changeInfo);
  console.log("New tab Info: ", tabInfo);
  console.log("---^----");
  if (tabInfo.status === "complete") {
    sendSignal(tabId);
  }
}

function getSettingValueError(error) {
  console.log(`Slowify-error: ${error}`);
}

// TODO add error on bad format
function onGotURLs(item) {
  if (item.urls) {
    url_patterns = item.urls.split(/\r?\n/);
    url_patterns = url_patterns.map((u) => u.trim());
    url_patterns = url_patterns.filter((n) => n);
  }

  let url_filter = { urls: url_patterns };

  browser.tabs.onActivated.addListener(handleActivated);
  browser.tabs.onUpdated.addListener(handleUpdated, url_filter);
}

// TODO figure out how to update this on change of settings
const getUrls = browser.storage.sync.get("urls");
getUrls.then(onGotURLs, getSettingValueError);

// TODO pause timers
browser.windows.onFocusChanged.addListener((windowId) => {
  console.log(`Newly focused window: ${windowId}`);
  isWindowFocused = !(windowId === -1);

  let getting = browser.windows
    .get(
      windowId // integer
    )
    .then(function (x) {
      console.log(x);
      function queryResult(tabs) {
        if (tabs.length > 0) {
          sendSignal(tabs[0].id);
        }
      }
      browser.tabs
        .query({ active: true, url: url_patterns })
        .then(queryResult, getSettingValueError);
    });
});
