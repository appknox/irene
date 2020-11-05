// jshint ignore: start
import ENV from 'irene/config/environment';

const installCrisp = function () {
  if (!ENV.crispWebsiteId || ENV.crispWebsiteId === '') {
    // eslint-disable-next-line no-console
    return console.log("Crisp Disabled");
  }
  window.$crisp = [];
  window.$crisp.push(['do', 'chat:hide']);
  window.CRISP_WEBSITE_ID = ENV.crispWebsiteId;
  (function () {
    let d = document;
    let s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
};

export default installCrisp;
