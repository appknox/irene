// Inject freshdesk support script that enables widget in the application
const injectSupportWidget = (widgetId) => {
  // Widget launch
  window.fwSettings = { widget_id: widgetId };

  !(function () {
    if ('function' != typeof window.FreshworksWidget) {
      var n = function () {
        n.q.push(arguments);
      };
      (n.q = []), (window.FreshworksWidget = n);
    }
  })();

  const s = document.createElement('script');
  s.src = `https://ind-widget.freshworks.com/widgets/${widgetId}.js`;
  s.async = 1;
  document.getElementsByTagName('head')[0].appendChild(s);
};

export { injectSupportWidget };
