/* eslint-disable prettier/prettier */
// Ref: https://gist.github.com/paulirish/1579671

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

//

function poll(cb, intvl) {
  var shouldStop = false;
  var previousExecuteTime = Date.now();

  function stop() {
    shouldStop = true;
  }

  function repeat() {
    if (shouldStop) {
      return;
    }

    if((Date.now() - previousExecuteTime) < intvl) {
      return window.requestAnimationFrame(repeat);
    }

    var ret = cb();
    if(ret && ret.then) {
      return ret.then((data) => {
        previousExecuteTime = Date.now();
        window.requestAnimationFrame(repeat);
        return data;
      }, (err) => {
        previousExecuteTime = Date.now();
        window.requestAnimationFrame(repeat);
        throw err;
      });
    }
    previousExecuteTime = Date.now();
    window.requestAnimationFrame(repeat);
  }

  window.requestAnimationFrame(repeat);
  return stop;
}

export default poll;
