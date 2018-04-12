// jshint ignore: start
import ENV from 'irene/config/environment';

const installInspectlet = function() {
  if (!ENV.enableInspectlet) {
    return console.log("Inspectlet is disabled");
  }
  (function() {})();
  window.__insp = window.__insp || [];
  __insp.push([
    'wid',
    474762302
  ]);

  const ldinsp = function() {
    if (typeof window.__inspld !== 'undefined') {
      return;
    }
    window.__inspld = 1;
    const insp = document.createElement('script');
    insp.type = 'text/javascript';
    insp.async = true;
    insp.id = 'inspsync';
    insp.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=474762302&r=' + Math.floor((new Date).getTime() / 3600000);
    const x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(insp, x);
  };

  setTimeout(ldinsp, 0);
};

export default installInspectlet;
