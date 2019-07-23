// jshint ignore: start
import ENV from 'irene/config/environment';

const installHeadWayApp = function() {
  if (!ENV.enableHeadwayApp) {
    // eslint-disable-next-line no-console
    return console.log("Head Way App Disable");
  }
  (function () {
    let d = document;
    let s = d.createElement("script");
    s.src = "https://cdn.headwayapp.co/widget.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
};

export default installHeadWayApp;
