import ENV from 'irene/config/environment';

const runtimeConfig = window.runtimeGlobalConfig;

function isTrue(value) {
  value = String(value).toLowerCase();
  return value === 'true';
}


function getPluginActivationStatus(pluginName){
  const pluginEnvVariable = ENV.thirdPartyPluginEnvMap[pluginName];
  if(runtimeConfig.hasOwnProperty(pluginEnvVariable.env) || ENV.hasOwnProperty(pluginEnvVariable.env)){
    return isTrue(runtimeConfig[pluginEnvVariable.env] || ENV[pluginEnvVariable.env]);
  }
  if(runtimeConfig.hasOwnProperty('ENTERPRISE') || ENV.hasOwnProperty('ENTERPRISE')){
    return !isTrue(runtimeConfig.ENTERPRISE || ENV.isEnterprise);
  }
  return pluginEnvVariable.default;
}

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

  if(runtimeConfig) {
    ENV.host = runtimeConfig.IRENE_API_HOST || ENV.host;
    var devicefarmEnv = runtimeConfig.IRENE_DEVICEFARM_URL;
    var deviceFarmPath = "websockify";
    if(devicefarmEnv) {
      const deviceFarmURL = new URL(deviceFarmPath, devicefarmEnv).href;
      ENV.deviceFarmURL = deviceFarmURL;
    }
    ENV.socketPath = runtimeConfig.IRENE_API_SOCKET_PATH || ENV.socketPath;
    ENV.enableSSO = isTrue(runtimeConfig.IRENE_ENABLE_SSO || ENV.enableSSO);
    ENV.isEnterprise = isTrue(runtimeConfig.ENTERPRISE || ENV.isEnterprise);
    ENV.isRegistrationEnabled = isTrue(runtimeConfig.IRENE_ENABLE_REGISTRATION || ENV.isRegistrationEnabled);
    ENV.registrationLink = runtimeConfig.registrationLink || ENV.registrationLink;
    ENV.whitelabel = Object.assign({}, ENV.whitelabel, runtimeConfig.whitelabel);
    ENV.enableCrisp= getPluginActivationStatus('crisp') || ENV.enableCrisp;
    ENV.enableHotjar= getPluginActivationStatus('hotjar') || ENV.enableHotjar;
    ENV.enablePendo= getPluginActivationStatus('pendo') || ENV.enablePendo;
    ENV.enableInspectlet= getPluginActivationStatus('inspectlet') || ENV.enableInspectlet;
    ENV.enableCSB= getPluginActivationStatus('csb') || ENV.enableCSB;
    ENV.enableMarketplace= getPluginActivationStatus('marketplace') || ENV.enableMarketplace;
    ENV.emberRollbarClient= {
      enabled: getPluginActivationStatus('rollbar') || ENV.emberRollbarClient.enabled
    };
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
