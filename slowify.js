// todo change these to let, and move everythiung inside a class
var slowify_timer = 0;
var max_slowify_timer_ms = 5000;
var slowify_transparentBG = false;
var slowify_div;
var slowify_progress_bar;
var slowify_interval;

function add_div() {
  if (slowify_div) {
    return;
  }

  slowify_div = document.createElement("div");
  slowify_div.id = "slowify-main";
  slowify_div.style.position = "fixed";
  slowify_div.style.top = "0";
  slowify_div.style.left = "0";
  slowify_div.style.width = "100%";
  slowify_div.style.height = "100%";
  slowify_div.style.zIndex = "1000";
  if (slowify_transparentBG) {
    slowify_div.style.background = "#000000DD";
  } else {
    slowify_div.style.background = "black";
  }
  slowify_div.style.color = "white";
  slowify_div.style.fontSize = "10em";
  slowify_div.style.paddingTop = "100px";
  slowify_div.style.textAlign = "center";
  slowify_div.innerHTML = "wait<br>&nbsp";
  document.body.appendChild(slowify_div);

  slowify_progress_bar = document.createElement("div");
  slowify_progress_bar.style.background = "red";
  slowify_progress_bar.style.width = "0%";
  slowify_progress_bar.style.left = "10rem";
  slowify_progress_bar.style.borderRadius = "50px";
  slowify_progress_bar.innerHTML = " &nbsp ";
  slowify_div.appendChild(slowify_progress_bar);

  handleEndOfTimer();
}

function handleEndOfTimer() {
  if (slowify_timer <= 0) {
    slowify_div.style.visibility = "hidden";

    chrome.runtime.sendMessage({ greeting: "GetURL" }, function (response) {
      console.log("RESPPPs", response);
    });

    return;
  } else {
    slowify_div.style.visibility = "visible";
  }
}

function updateUI() {
  slowify_progress_bar.style.width =
    Math.min(100 - (slowify_timer / max_slowify_timer_ms) * 100, 100) + "%";

  slowify_div.innerHTML = "wait<br>" + Math.ceil(slowify_timer / 1000);
  slowify_div.appendChild(slowify_progress_bar);
}

function setup_timer() {
  if (!slowify_interval) {
    slowify_interval = setInterval(myTimer, 500);
  }
}

function reset_timer() {
  slowify_timer = max_slowify_timer_ms;
}

function myTimer() {
  console.log("TIMER");
  slowify_timer = slowify_timer - 500;
  updateUI();
  handleEndOfTimer();
}

function myStopFunction() {
  console.log("myStopFunction1");
  if (slowify_interval) {
    console.log("myStopFunction2");
    clearInterval(slowify_interval);
    slowify_interval = null;
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("request", request);
  if (request.cancel_timer) {
    myStopFunction();
    return;
  } else if (request.only_timer) {
    add_div();
    setup_timer();
    return;
  } else {
    add_div();
    setup_timer();
    reset_timer();
    updateUI();
  }
  var response = "HI! from the CS.";
  sendResponse(response);
});

function getSettingValueError(error) {
  console.log(`Slowify-error: ${error}`);
}

function onGotSettingValueWaittime(item) {
  max_slowify_timer_ms = parseInt(item.waittime);
}

function onGotSettingValueTransparentBG(item) {
  slowify_transparentBG = item.transparentbg;
}

const getSettingTransparentBG = browser.storage.sync.get("transparentbg");
getSettingTransparentBG.then(
  onGotSettingValueTransparentBG,
  getSettingValueError
);

const getSettingValueWaittime = browser.storage.sync.get("waittime");
getSettingValueWaittime.then(onGotSettingValueWaittime, getSettingValueError);
