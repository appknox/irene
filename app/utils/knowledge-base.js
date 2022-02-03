// Inject document360 script that enable widget in the application
const injectDocument360 = (apiKey) => {
  (function (w, d, s, o, f, js, fjs) {
    w['JS-Widget'] = o;
    w[o] =
      w[o] ||
      function () {
        (w[o].q = w[o].q || []).push(arguments);
      };
    (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
    js.id = o;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  })(
    window,
    document,
    'script',
    'mw',
    'https://cdn.document360.io/static/js/widget.js'
  );
  // eslint-disable-next-line
  mw('init', {
    apiKey,
  });
};

// Open the document360 overlay panel by implicitly clicking the widget button
const openKnowledgeBasePanel = () => {
  document
    .getElementById('document360-widget-iframe')
    .contentDocument.getElementById('doc360-button')
    .click();
};

export { injectDocument360, openKnowledgeBasePanel };
