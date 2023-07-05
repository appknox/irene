// Ref: https://gist.github.com/paulirish/1579671

let lastTime = 0;

const vendors = ['ms', 'moz', 'webkit', 'o'];

for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  // @ts-expect-error TODO: fix this
  window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];

  // @ts-expect-error TODO: fix this
  // prettier-ignore
  window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function (callback) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));

    const id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);

    lastTime = currTime + timeToCall;

    return id;
  };
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

function poll(cb: () => Promise<unknown> | unknown, intvl: number) {
  let shouldStop = false;
  let previousExecuteTime = Date.now();

  function stop() {
    shouldStop = true;
  }

  function repeat() {
    if (shouldStop) {
      return;
    }

    if (Date.now() - previousExecuteTime < intvl) {
      return window.requestAnimationFrame(repeat); //NOSONAR
    }

    const ret = cb();

    if (ret && (ret as Promise<unknown>).then) {
      return (ret as Promise<unknown>).then(
        (data) => {
          previousExecuteTime = Date.now();
          window.requestAnimationFrame(repeat); //NOSONAR

          return data;
        },
        (err) => {
          previousExecuteTime = Date.now();
          window.requestAnimationFrame(repeat); //NOSONAR

          throw err;
        }
      );
    }

    previousExecuteTime = Date.now();
    window.requestAnimationFrame(repeat); //NOSONAR
  }

  window.requestAnimationFrame(repeat); //NOSONAR
  return stop;
}

export default poll;
