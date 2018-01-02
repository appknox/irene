/* jshint ignore:start */
import ENV from 'irene/config/environment';
var customerSuccessBox;
customerSuccessBox = function() {
  if(!ENV.enableCSB) {
    return(console.log("CSB Disabled"))
  }
  else {
    var analytics = window.analytics = window.analytics || [];
    if (!analytics.initialize)if (analytics.invoked) window.console && console.error && console.error("CustomerSuccess snippet included twice.");
    else {
      analytics.invoked = !0;
      analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on"];
      analytics.factory = function (t) {
        return function () {
          var e = Array.prototype.slice.call(arguments);
          e.unshift(t);
          analytics.push(e);
          return analytics
        }
      };
      for (var t = 0; t < analytics.methods.length; t++) {
        var e = analytics.methods[t];
        analytics[e] = analytics.factory(e)
      }
      window._csb = {
        apiKey: "HOmdGmRllZJ9Gg76AnzoLKAwXPreHNy5cYh6iEVkZLM=",
        apiHost : "https://appknox.customersuccessbox.com/api_js/v1_1"
      };
      analytics.load = function (callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.async = !0;
        script.src = "https://d1h5mit33yhtph.cloudfront.net/analytics.js";
        script.addEventListener('load', function (e) {
          if (typeof callback === 'function') {
            callback(e);
          }
        }, false);
        var n = document.getElementsByTagName("script")[0];
        n.parentNode.insertBefore(script, n)
      };
      analytics.load(function () {
      });
    }
  }
};

export default customerSuccessBox;
/* jshint ignore:end */
