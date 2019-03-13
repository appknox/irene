// jshint ignore: start
import ENV from 'irene/config/environment';

const installCrisp = function() {
  if (!ENV.enableCrisp) {
    // eslint-disable-next-line no-console
    return console.log("Crisp Disabled");
  }
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = "806bf0a8-c022-4a1f-ae9b-ecb859c001b4";
  (function () {
    let d = document;
    let s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
};

export default installCrisp;
