import ENV from 'irene/config/environment';

const initialize = function(application) {
  // inject Ajax
  application.inject('route', 'ajax', 'service:ajax');
  application.inject('component', 'ajax', 'service:ajax');

  // Inject notify
  application.inject('route', 'notify', 'service:notification-messages');
  application.inject('component', 'notify', 'service:notification-messages');
  application.inject('authenticator', 'notify', 'service:notification-messages');

  // Inject realtime
  application.inject('component', 'realtime', 'service:realtime');

  // Inject Store
  application.inject('component', 'store', 'service:store');

  // Inject ENV
  if (ENV.environment !== 'test') {
    // FIXME: Fix this test properly
    application.register('env:main', ENV, {singleton: true, instantiate: false});
    return application.inject('component', 'env', 'env:main');
  }
};

const IreneInitializer = {
  name: 'irene',
  initialize
};

export {initialize};
export default IreneInitializer;
