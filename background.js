/*
  TODO: figure out how to update list of URLs on change in the settings panel
  TODO: add error on bad URL format
*/

let url_patterns = [];
let time_of_last_distraction = 0;
let isWindowFocused;
const TIMEOUT_TIME_SEC = 60;

browser.storage.sync.get("urls").then(onSettingGotURLs, handleError);

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
  if (tabInfo.status === "complete") startProgressBar(tabId);
}

function handleTabActivated() {
  console.log("handleTabActivated");
  cancelTimers(activeInfo.previousTabId);

  browser.tabs
    .query({ active: true, url: url_patterns })
    .then(onQueryFinished, handleError);

  function onQueryFinished(tabs) {
    if (tabs.length > 0 && activeInfo.tabId === tabs[0].id) {
      startProgressBar(tabs[0].id);
    }
  }
}

function handleWindowFocusChanged() {
  isWindowFocused = !(windowId === -1);

  browser.windows.get(windowId).then(function (x) {
    function queryResult(tabs) {
      if (tabs.length > 0) {
        startProgressBar(tabs[0].id);
      }
    }
    browser.tabs
      .query({ active: true, url: url_patterns })
      .then(queryResult, handleError);
  });
}

// TODO make this blocking
function handleContentScriptPingMessage(request, sender, sendResponse) {
  if (sender.tab.active && isWindowFocused) {
    time_of_last_distraction = Date.now();
  }
}

function startProgressBar(tabId) {
  let data = { only_timer: false, cancel_timers: false };
  if (timeSinceLastDistraction() < TIMEOUT_TIME_SEC * 1000) {
    data = { only_timer: true, cancel_timers: false };
  }

  browser.tabs.sendMessage(tabId, data, function () {});
}

function timeSinceLastDistraction() {
  return Date.now() - time_of_last_distraction;
}

function cancelTimers(tabId) {
  let data = { cancel_timer: true };
  browser.tabs.sendMessage(tabId, data, function () {});
}
