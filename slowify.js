// TODO make a class
// TODO use animation

let slowify_setting_max_timer_ms = 5000;
let slowify_setting_transparentBG = false;
const TIMER_CALL_FREQUENCY_MS = 500;

let slowify_interval;
let slowify_timer = 0;

let slowify_element_main_div;
let slowify_progress_bar_div;

browser.storage.sync.get("waittime").then(function (item) {
  slowify_setting_max_timer_ms = parseInt(parseFloat(item.waittime) * 1000);
}, handleError);

browser.storage.sync.get("transparentbg").then(function (item) {
  slowify_setting_transparentBG = item.transparentbg;
}, handleError);

function handleError(error) {
  console.log(`Slowify-error: ${error}`);
}

chrome.runtime.onMessage.addListener(handleMessage);
console.log("addListener");

function handleMessage(request, sender, sendResponse) {
  console.log("handleMessage", request);
  switch (request.slowify_action) {
    case "start_new_progress_bar":
      reset_timer();
      setup();
      updateUI();
      break;
    case "ping_presence":
      slowify_timer = 0;
      setup();
      updateUI();
      break;
    case "destroy_timer":
      destroyTimer();
      break;
  }
  sender.sendResponse("done");
}

function reset_timer() {
  slowify_timer = slowify_setting_max_timer_ms;
}

function destroyTimer() {
  if (slowify_interval) {
    clearInterval(slowify_interval);
    slowify_interval = null;
  }
}

function setup() {
  create_timer();
  create_html_elements();
}

function create_timer() {
  if (!slowify_interval) {
    slowify_interval = setInterval(onTimerEvent, TIMER_CALL_FREQUENCY_MS);
  }
}

function onTimerEvent() {
  slowify_timer = slowify_timer - TIMER_CALL_FREQUENCY_MS;
  if (slowify_timer < 0) {
    ping_background_script();
  }
  updateUI();
}

function ping_background_script() {
  chrome.runtime.sendMessage({ greeting: "GetURL" }, function (response) {});
}

function create_html_elements() {
  if (slowify_element_main_div) {
    return;
  }

  slowify_element_main_div = document.createElement("div");
  slowify_element_main_div.id = "slowify-main";

  let slowify_background = slowify_setting_transparentBG
    ? "#000000DD"
    : "black";

  slowify_element_main_div.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  padding-top: 1vh;
  width: 100%;
  height: 100%;
  z-index: 1000;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;  background: ${slowify_background};
  `;

  document.body.appendChild(slowify_element_main_div);

  slowify_progress_bar_div = document.createElement("div");
  slowify_progress_bar_div.style.cssText = `
  color: white;
  font-size: 10vh;
  background:linear-gradient(#e66465, #9198e5); 
  width: 100%;
  height: 50vh;
  line-height: 50vh;
  font-size: 10vh;
  border-radius: 50px;
  `;

  slowify_progress_bar_div.innerHTML = " - ";
  slowify_element_main_div.appendChild(slowify_progress_bar_div);
}

function updateUI() {
  if (slowify_timer <= 0) {
    slowify_element_main_div.style.visibility = "hidden";
    return;
  }

  slowify_element_main_div.style.visibility = "visible";

  slowify_progress_bar_div.style.width =
    Math.max(
      10,
      Math.min(90, (slowify_timer / slowify_setting_max_timer_ms) * 100)
    ) + "%";

  slowify_progress_bar_div.innerHTML = Math.ceil(slowify_timer / 1000);
}
