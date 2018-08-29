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

  let runtimeConfig = window.runtimeGlobalConfig;

  if(runtimeConfig) {
    ENV.host = runtimeConfig.IRENE_API_HOST || ENV.host;
    var devicefarmEnv = runtimeConfig.IRENE_DEVICEFARM_URL;
    if(devicefarmEnv) {
      let deviceFarmWebsockifyHost = new URL(devicefarmEnv);
      let deviceFarmSsl = deviceFarmWebsockifyHost.protocol === "wss:";
      ENV.deviceFarmSsl = deviceFarmSsl;
      ENV.deviceFarmPort = deviceFarmWebsockifyHost.port || (deviceFarmSsl ? 443:80);
      ENV.deviceFarmHost = deviceFarmWebsockifyHost.hostname;
    }
    ENV.socketPath = runtimeConfig.IRENE_API_SOCKET_PATH || ENV.socketPath;
    ENV.enableSSO = runtimeConfig.IRENE_ENABLE_SSO || ENV.enableSSO;
    ENV.isEnterprise = runtimeConfig.ENTERPRISE || ENV.isEnterprise;
    ENV.whitelabel = Object.assign({}, ENV.whitelabel, runtimeConfig.whitelabel);
  }

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
