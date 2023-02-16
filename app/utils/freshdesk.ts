/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

// Inject freshdesk support script that enables widget in the application
const injectSupportWidget = (widgetId: string) => {
  // Widget launch
  window.fwSettings = { widget_id: widgetId };

  !(function () {
    if ('function' != typeof window.FreshworksWidget) {
      // eslint-disable-next-line no-var
      var n = function () {
        // eslint-disable-next-line prefer-rest-params
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
