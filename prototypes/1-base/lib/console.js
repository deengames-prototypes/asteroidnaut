// all ur consonlez r belong 2 us ...
if (typeof console  != "undefined" && typeof console.log != 'undefined') {
  console.oldLog = console.log;
} else {
  console.oldLog = function() {};
}

console.debug = function(message) {
  console.oldLog(message);
  log('#00f', message);
};

console.error = function(message) {
  console.oldLog(message);
  log('#f00', message);
}

console.info = function(message) {
  console.oldLog(message);
  log('#888', message);
}

console.log = function(message) {
  console.oldLog(message);
  log('#000', message);
}

window.onerror = function(message, url, lineNumber) {
  console.error(url + "\tline " + lineNumber + ":<br />" + message);
}

function log(color, message) {
  var html = "<span style='color: " + color + ";'>" + message + "</span><br />";
  document.getElementById("console").innerHTML += html;
  scrollToEnd();
}

function scrollToEnd() {
  var elem = document.getElementById('console');
  elem.scrollTop = elem.scrollHeight;
  // scrollTop is always reset to 0
}
