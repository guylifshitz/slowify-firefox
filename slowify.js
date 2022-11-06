var slowify_timer = 5000;

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
div.innerHTML = "facebook<br>" + slowify_timer / 1000;
document.body.appendChild(div);

setInterval(myTimer, 1000);

function myTimer() {
  slowify_timer = slowify_timer - 1000;
  div.innerHTML = "facebook<br>" + slowify_timer / 1000;
  if (slowify_timer <= 0) {
    document.body.removeChild(div);
  }
}
