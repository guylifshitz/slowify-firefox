var slowify_timer = 5000;

function setup() {
  var div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.zIndex = "1000";
  div.style.background = "black";
  div.style.color = "white";
  div.style.fontSize = "10em";
  div.style.paddingTop = "100px";
  div.style.textAlign = "center";
  div.innerHTML = "wait<br>" + slowify_timer / 1000;

  document.body.appendChild(div);

  function myTimer() {
    slowify_timer = slowify_timer - 1000;
    div.innerHTML = "wait<br>" + slowify_timer / 1000;
    if (slowify_timer <= 0) {
      document.body.removeChild(div);
    }
  }
  setInterval(myTimer, 1000);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onGotWaittime(item) {
  slowify_timer = item.waittime;
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

const getting = browser.storage.sync.get("urls");
getting.then(onGotURLs, onError);
