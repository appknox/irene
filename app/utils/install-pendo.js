/* eslint-disable prettier/prettier */
// jshint ignore: start
import ENV from 'irene/config/environment';

const installPendo = function() {
  if (!ENV.enablePendo) {
    // eslint-disable-next-line no-console
    return console.log("Pendo Disabled");
  }
  return (function(apiKey) {
    (function(p, e, n, d, o) {
      let v = undefined;
      let w = undefined;
      let x = undefined;
      let y = undefined;
      let z = undefined;
      o = (p[d] = p[d] || {});
      o._q = [];
      v = [
        'initialize',
        'identify',
        'updateOptions',
        'pageLoad'
      ];
      w = 0;
      x = v.length;
      while (w < x) {
        (function(m) {
          o[m] = o[m] || function() {
            o._q[m === v[0] ? 'unshift' : 'push']([ m ].concat([].slice.call(arguments, 0)));
          };
        })(v[w]);
        ++w;
      }
      y = e.createElement(n);
      y.async = !0;
      y.src = `https://cdn.pendo.io/agent/static/${apiKey}/pendo.js`;
      z = e.getElementsByTagName(n)[0];
      z.parentNode.insertBefore(y, z);
    })(window, document, 'script', 'pendo');
  })('f0a11665-8469-4c41-419f-b9f400b01f08');
};

export default installPendo;
