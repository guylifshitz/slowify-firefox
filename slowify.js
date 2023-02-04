var slowify_timer = 5000;
var transparentBG = false;

function setup() {
  var div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.zIndex = "1000";
  if (transparentBG) {
    div.style.background = "#000000DD";
  } else {
    div.style.background = "black";
  }
  div.style.color = "white";
  div.style.fontSize = "10em";
  div.style.paddingTop = "100px";
  div.style.textAlign = "center";
  div.innerHTML = "wait<br>&nbsp";

  var div_progress = document.createElement("div");
  div_progress.style.background = "red";
  div_progress.style.width = "0%";
  div_progress.innerHTML =
    " --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ";
  div.appendChild(div_progress);

  document.body.appendChild(div);

  function updateUIText() {
    div.innerHTML = "wait<br>" + Math.ceil(slowify_timer / 1000);
    div_progress.style.width = 100 - (slowify_timer / 5000) * 100 + "%";
    div.appendChild(div_progress);
  }

  function removeIfOver() {
    if (slowify_timer <= 0) {
      document.body.removeChild(div);
    }
  }
  function myTimer() {
    slowify_timer = slowify_timer - 500;
    updateUIText();
    removeIfOver();
  }

  updateUIText();
  setInterval(myTimer, 500);
}

function onError(error) {
  console.log(`Slowify-error: ${error}`);
}

function onGotWaittime(item) {
  slowify_timer = item.waittime;
}

function onGotTransparentBG(item) {
  transparentBG = item.transparentbg;
}

function onGotURLs(item) {
  let urls = "";
  if (item.urls) {
    urls = item.urls.split(/\r?\n/);
  }

  let url = window.location.href;

  urls.forEach((item) => {
    var re = new RegExp(item);
    if (re.test(url)) {
      setup();
    }
  });
}

const getWaittime = browser.storage.sync.get("waittime");
getWaittime.then(onGotWaittime, onError);

const getTransparentBG = browser.storage.sync.get("transparentbg");
getTransparentBG.then(onGotTransparentBG, onError);

const getting = browser.storage.sync.get("urls");
getting.then(onGotURLs, onError);
