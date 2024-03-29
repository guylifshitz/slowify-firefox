/*
  TODO: figure out how to update list of URLs on change in the settings panel
  TODO: add error on bad URL format
  TODO: make sure there are no concurrency problems
        caused by query that returns after a message from a tab ping 
*/

let url_patterns = [];
let time_of_last_distraction = 0;
let isTabFocused;
let timeout_time_ms = 10 * 60 * 1000;

browser.storage.sync.get("urls").then(onSettingGotURLs, handleError);
browser.storage.sync.get("timeouttime").then(function (item) {
  timeout_time_ms = parseInt(parseFloat(item.timeouttime) * 1000);
}, handleError);

function handleError(error) {
  console.log(`Slowify-error: ${error}`);
}

function onSettingGotURLs(item) {
  url_patterns = parseURLSetting(item.urls);

  setup_listeners();
}

function parseURLSetting(urls) {
  if (!urls) return [];

  return urls
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter((n) => n);
}

function setup_listeners() {
  browser.tabs.onUpdated.addListener(handleTabUpdated, { urls: url_patterns });
  browser.tabs.onActivated.addListener(handleTabActivated);
  browser.windows.onFocusChanged.addListener(handleWindowFocusChanged);
  chrome.runtime.onMessage.addListener(handleContentScriptPingMessage);
}

function handleTabUpdated(tabId, changeInfo, tabInfo) {
  if (tabInfo.status === "complete")
    setTimeout(function () {
      startProgressBar(tabId);
    }, 200);
}

function handleTabActivated(activeInfo) {
  if (activeInfo.previousTabId) cancelTimer(activeInfo.previousTabId);

  isTabFocused = false;

  browser.tabs
    .query({ active: true, url: url_patterns })
    .then(onQueryFinished, handleError);

  function onQueryFinished(tabs) {
    isTabFocused = true;
    if (tabs.length > 0 && activeInfo.tabId === tabs[0].id) {
      startProgressBar(tabs[0].id);
    }
  }
}

function handleWindowFocusChanged(windowId) {
  if (!(windowId === -1)) {
    browser.windows.get(windowId).then(function (x) {
      function queryResult(tabs) {
        isTabFocused = true;
        if (tabs.length > 0) {
          startProgressBar(tabs[0].id);
        }
      }
      browser.tabs
        .query({ active: true, url: url_patterns })
        .then(queryResult, handleError);
    });
  } else {
    isTabFocused = false;
  }
}

function handleContentScriptPingMessage(request, sender, sendResponse) {
  if (sender.tab.active && isTabFocused) {
    time_of_last_distraction = Date.now();
  }
}

function startProgressBar(tabId) {
  let show_distraction = timeSinceLastDistraction() > timeout_time_ms;
  let action = show_distraction ? "start_new_progress_bar" : "ping_presence";
  let data = { slowify_action: action };
  browser.tabs.sendMessage(tabId, data, function () {});
}

function timeSinceLastDistraction() {
  return Date.now() - time_of_last_distraction;
}

function cancelTimer(tabId) {
  let data = { slowify_action: "destroy_timer" };
  browser.tabs.sendMessage(tabId, data, function () {});
}
