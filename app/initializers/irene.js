import ENV from "irene/config/environment";

class ENVHandler {
  constructor(envHandlerConst) {
    this.envHandlerConst = envHandlerConst;
  }

  isRuntimeAvailable() {
    return !(typeof runtimeGlobalConfig == "undefined");
  }

  getEnv(env_key) {
    this.assertEnvKey(env_key);
    if (this.isAvailableInRuntimeENV(env_key)) {
      return this.getRuntimeObject()[env_key];
    }
    if (this.isAvailableInProcessENV(env_key)) {
      return this.envHandlerConst.processENV[env_key];
    }
    return this.getDefault(env_key);
  }

  isRegisteredEnv(env_key) {
    return this.envHandlerConst.possibleENVS.indexOf(env_key) > -1;
  }

  isAvailableInENV(env_key) {
    return (
      this.isAvailableInRuntimeENV(env_key) ||
      this.isAvailableInProcessENV(env_key)
    );
  }

  getRuntimeObject() {
    if (this.isRuntimeAvailable()) {
      return runtimeGlobalConfig; // eslint-disable-line
    }
    return {};
  }

  isAvailableInRuntimeENV(env_key) {
    const runtimeObj = this.getRuntimeObject();
    return env_key in runtimeObj;
  }

  isAvailableInProcessENV(env_key) {
    return env_key in this.envHandlerConst.processENV;
  }

  assertEnvKey(env_key) {
    if (!this.isRegisteredEnv(env_key)) {
      throw new Error(`ENV: ${env_key} not registered`);
    }
  }

  isTrue(value) {
    value = String(value).toLowerCase();
    return value === "true";
  }

  getBoolean(env_key) {
    return this.isTrue(this.getEnv(env_key));
  }

  getDefault(env_key) {
    this.assertEnvKey(env_key);
    return this.envHandlerConst.defaults[env_key];
  }

  getValueForPlugin(env_key) {
    const enterpriseKey = "ENTERPRISE";
    this.assertEnvKey(enterpriseKey);
    this.assertEnvKey(env_key);

    if (this.isAvailableInENV(env_key)) {
      return this.getBoolean(env_key);
    }

    if (this.isAvailableInENV(enterpriseKey)) {
      return !this.getBoolean(enterpriseKey);
    }

    return this.getDefault(env_key);
  }
}

const handler = new ENVHandler(ENV.ENVHandlerCONST);

const initialize = function (application) {
  // inject Ajax
  application.inject("route", "ajax", "service:ajax");
  application.inject("component", "ajax", "service:ajax");

  // Inject notify
  application.inject("route", "notify", "service:notifications");
  application.inject("component", "notify", "service:notifications");
  application.inject("authenticator", "notify", "service:notifications");

  // Inject realtime
  application.inject("component", "realtime", "service:realtime");

  // Inject Store
  application.inject("component", "store", "service:store");

  ENV.host = handler.getEnv("IRENE_API_HOST");
  ENV.devicefarmHost = handler.getEnv("IRENE_DEVICEFARM_HOST");
  var devicefarmEnv = handler.getEnv("IRENE_DEVICEFARM_URL");
  var deviceFarmPath = "websockify";
  if (devicefarmEnv) {
    const deviceFarmURL = new URL(deviceFarmPath, devicefarmEnv).href;
    ENV.deviceFarmURL = deviceFarmURL;
  }

  ENV.socketPath = handler.getEnv("IRENE_API_SOCKET_PATH");
  ENV.isEnterprise = handler.getBoolean("ENTERPRISE");
  ENV.showLicense = handler.getBoolean("IRENE_SHOW_LICENSE");
  ENV.isRegistrationEnabled = handler.getBoolean("IRENE_ENABLE_REGISTRATION");
  ENV.registrationLink = handler.getEnv("IRENE_REGISTRATION_LINK");
  ENV.whitelabel = Object.assign({}, ENV.whitelabel, {
    enabled: handler.getBoolean("WHITELABEL_ENABLED"),
    name: handler.getEnv("WHITELABEL_NAME"),
    logo: handler.getEnv("WHITELABEL_LOGO"),
    theme: handler.getEnv("WHITELABEL_THEME"),
  });

  ENV.enableCrisp = handler.getValueForPlugin("IRENE_ENABLE_CRISP");
  ENV.enableHotjar = handler.getValueForPlugin("IRENE_ENABLE_HOTJAR");
  ENV.enablePendo = handler.getValueForPlugin("IRENE_ENABLE_PENDO");
  ENV.enableCSB = handler.getValueForPlugin("IRENE_ENABLE_CSB");
  ENV.enableMarketplace = handler.getValueForPlugin("IRENE_ENABLE_MARKETPLACE");
  ENV.emberRollbarClient = {
    enabled: handler.getValueForPlugin("IRENE_ENABLE_ROLLBAR"),
  };

  // Inject ENV
  if (ENV.environment !== "test") {
    // FIXME: Fix this test properly
    application.register("env:main", ENV, {
      singleton: true,
      instantiate: false,
    });
    return application.inject("component", "env", "env:main");
  }
};

const IreneInitializer = {
  name: "irene",
  initialize,
};

export { initialize };
export default IreneInitializer;
