/// A collection of random functions. See below.

// Used as a global click handler. You can check for a global click by using
// an EnterFrame event and checking if(mouseDown) { ... }
window.onload = function() {
  // global mouse handler
  window.mouseDown = 0;

  document.body.onmousedown = function() {
    mouseDown++;
  }
  document.body.onmouseup = function() {
    mouseDown--;
  }
}

// Inclusive of a, exclusive of b
// AKA: [a, b)
// AKA: a <= n < b
function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a)) + a;
}

// Get a variable from external.json.
function extern(key, hideWarning) {
  if (window.externs[key] === undefined && !hideWarning) {
    console.error("Missing extern: " + key);
    return undefined;
  } else {
    var value = window.externs[key];
    return value;
  }
}

// Load an array of images
function loadImages(images, callback) {
  Crafty.load({ "images": images },
    function() {
      if (callback != null) {
        callback();
      }
    }, function(p) {
      // p.percent gives us progress
      console.log(p.percent + "% loaded");
    }, function(e) {
      alert("Error loading images: " + e);
    }
  );
}

// Hash contains probabilities, and options. Numbers can be decimal
// or whole, and don't need to add up to 1.0 or 100. For example:
// { "apples": 80, "bananas": 20 }
// { "chicken": 0.5, "beef": 0.4, "veal": 0.3 }
function weightedRandom(hash) {
  // Break hash into two lists. Filters out anything with p=0.
  var list = [];
  var weight = [];

  for (var k in hash) {
    // http://stackoverflow.com/a/11561440/210780
    // use hasOwnProperty to filter out keys from the Object.prototype
    if (hash.hasOwnProperty(k)) {
      var p = hash[k];
      if (p > 0) {
        list.push(k);
        weight.push(p);
      }
    }
  }

  // http://codetheory.in/weighted-biased-random-number-generation-with-javascript-based-on-probability/

  var total_weight = weight.reduce(function (prev, cur, i, arr) {
      return prev + cur;
  });

  var random_num = randomBetween(0, total_weight);
  var weight_sum = 0;

  for (var i = 0; i < list.length; i++) {
      weight_sum += weight[i];
      weight_sum = +weight_sum.toFixed(2);

      if (random_num <= weight_sum) {
          return list[i];
      }
  }
};

// Returns the value of a query parameter. Probably as a string.
// Original source: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
// It's probably very slow. We should cache these in a hash.
function queryParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// A combination of extern and queryParam. Returns query param first, then extern.
function config(name) {
  return  queryParam(name) || extern(name, true);
}