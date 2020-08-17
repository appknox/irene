import ENV from 'irene/config/environment';

const runtimeConfig = window.runtimeGlobalConfig;

function isTrue(value) {
  value = String(value).toLowerCase();
  return value === 'true';
}


function getPluginActivationStatus(pluginName){
  const pluginEnvVariable = ENV.thirdPartyPluginEnvMap[pluginName];

  if(pluginEnvVariable.env in runtimeConfig){
    return isTrue(runtimeConfig[pluginEnvVariable.env]);
  }
  if('ENTERPRISE' in runtimeConfig){
    return !isTrue(runtimeConfig.ENTERPRISE);
  }
  return pluginEnvVariable.default;
}

const initialize = function(application) {
  // inject Ajax
  application.inject('route', 'ajax', 'service:ajax');
  application.inject('component', 'ajax', 'service:ajax');

  // Inject notify
  application.inject('route', 'notify', 'service:notifications');
  application.inject('component', 'notify', 'service:notifications');
  application.inject('authenticator', 'notify', 'service:notifications');

  // Inject realtime
  application.inject('component', 'realtime', 'service:realtime');

  // Inject Store
  application.inject('component', 'store', 'service:store');

  if(runtimeConfig) {
    const envKeys = Object.keys(runtimeConfig);

    ENV.host = runtimeConfig.IRENE_API_HOST || ENV.host;
    ENV.devicefarmHost = runtimeConfig.IRENE_DEVICEFARM_HOST || ENV.devicefarmHost;
    var devicefarmEnv = runtimeConfig.IRENE_DEVICEFARM_URL;
    var deviceFarmPath = "websockify";
    if(devicefarmEnv) {
      const deviceFarmURL = new URL(deviceFarmPath, devicefarmEnv).href;
      ENV.deviceFarmURL = deviceFarmURL;
    }

    ENV.socketPath = runtimeConfig.IRENE_API_SOCKET_PATH || ENV.socketPath;
    ENV.isEnterprise = envKeys.indexOf('isEnterprise') > -1 ? isTrue(runtimeConfig.ENTERPRISE) : ENV.isEnterprise;
    ENV.showLicense = envKeys.indexOf('showLicense') > -1 ? isTrue(runtimeConfig.IRENE_SHOW_LICENSE) : ENV.showLicense;
    ENV.isRegistrationEnabled = envKeys.indexOf('isRegistrationEnabled') > -1 ? isTrue(runtimeConfig.IRENE_ENABLE_REGISTRATION) : ENV.isRegistrationEnabled;
    ENV.registrationLink = runtimeConfig.registrationLink || ENV.registrationLink;
    ENV.whitelabel = Object.assign({}, ENV.whitelabel, runtimeConfig.whitelabel);


    ENV.enableCrisp = envKeys.indexOf('enableCrisp') > -1 ? getPluginActivationStatus('crisp') : ENV.enableCrisp;
    ENV.enableHotjar= envKeys.indexOf('enableHotjar') > -1 ? getPluginActivationStatus('hotjar') : ENV.enableHotjar;
    ENV.enablePendo= envKeys.indexOf('enablePendo') > -1 ? getPluginActivationStatus('pendo') : ENV.enablePendo;
    ENV.enableCSB= envKeys.indexOf('enableCSB') > -1 ? getPluginActivationStatus('csb') : ENV.enableCSB;
    ENV.enableMarketplace= envKeys.indexOf('enableMarketplace') > -1 ? getPluginActivationStatus('marketplace') : ENV.enableMarketplace;
    ENV.emberRollbarClient= envKeys.indexOf('emberRollbarClient') > -1 ? {...ENV.emberRollbarClient,enabled: getPluginActivationStatus('rollbar')} : ENV.emberRollbarClient;
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
