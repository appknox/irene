import ENV from 'irene/config/environment';
import installPendo from 'irene/utils/install-pendo';
import installHotjar from 'irene/utils/install-hotjar';
import customerSuccessBox from 'irene/utils/customer-success-box';

/**
 * Class to handle environment variables
 */
class ENVHandler {
  /**
   * @param {Object} envHandlerConst - The environment handler constants
   */
  constructor(envHandlerConst) {
    this.envHandlerConst = envHandlerConst;
  }

  /**
   * Checks if runtime configuration is available
   * @returns {boolean} True if runtime configuration is available
   */
  isRuntimeAvailable() {
    return typeof runtimeGlobalConfig !== 'undefined';
  }

  /**
   * Gets the value of an environment variable
   * @param {string} envKey - The key of the environment variable
   * @returns {string} The value of the environment variable
   */
  getEnv(envKey) {
    const hostKey = 'IRENE_API_HOST';
    this.assertEnvKey(envKey);

    if (this.isAvailableInRuntimeENV(envKey)) {
      const runtimeValue = this.getRuntimeObject()[envKey];

      if (envKey === hostKey && runtimeValue === '/') {
        return '';
      }

      return runtimeValue;
    }

    if (this.isAvailableInProcessENV(envKey)) {
      const processValue = this.envHandlerConst.processENV[envKey];

      if (envKey === hostKey && processValue === '/') {
        return '';
      }

      return processValue;
    }

    return this.getDefault(envKey);
  }

  /**
   * Checks if an environment variable is registered
   * @param {string} envKey - The key of the environment variable
   * @returns {boolean} True if the environment variable is registered
   */
  isRegisteredEnv(envKey) {
    return this.envHandlerConst.possibleENVS.includes(envKey);
  }

  /**
   * Checks if an environment variable is available in any environment
   * @param {string} envKey - The key of the environment variable
   * @returns {boolean} True if the environment variable is available
   */
  isAvailableInENV(envKey) {
    return (
      this.isAvailableInRuntimeENV(envKey) ||
      this.isAvailableInProcessENV(envKey)
    );
  }

  /**
   * Gets the runtime configuration object
   * @returns {Object} The runtime configuration object
   */
  getRuntimeObject() {
    // eslint-disable-next-line
    return this.isRuntimeAvailable() ? runtimeGlobalConfig : {};
  }

  /**
   * Checks if an environment variable is available in runtime environment
   * @param {string} envKey - The key of the environment variable
   * @returns {boolean} True if the environment variable is available in runtime
   */
  isAvailableInRuntimeENV(envKey) {
    return envKey in this.getRuntimeObject();
  }

  /**
   * Checks if an environment variable is available in process environment
   * @param {string} envKey - The key of the environment variable
   * @returns {boolean} True if the environment variable is available in process
   */
  isAvailableInProcessENV(envKey) {
    return envKey in this.envHandlerConst.processENV;
  }

  /**
   * Asserts that an environment variable is registered
   * @param {string} envKey - The key of the environment variable
   * @throws {Error} If the environment variable is not registered
   */
  assertEnvKey(envKey) {
    if (!this.isRegisteredEnv(envKey)) {
      throw new Error(`ENV: ${envKey} not registered`);
    }
  }

  /**
   * Checks if a value is true
   * @param {*} value - The value to check
   * @returns {boolean} True if the value is true
   */
  isTrue(value) {
    return String(value).toLowerCase() === 'true';
  }

  /**
   * Gets the boolean value of an environment variable
   * @param {string} envKey - The key of the environment variable
   * @returns {boolean} The boolean value of the environment variable
   */
  getBoolean(envKey) {
    return this.isTrue(this.getEnv(envKey));
  }

  /**
   * Gets the default value of an environment variable
   * @param {string} envKey - The key of the environment variable
   * @returns {*} The default value of the environment variable
   */
  getDefault(envKey) {
    this.assertEnvKey(envKey);

    return this.envHandlerConst.defaults[envKey];
  }

  /**
   * Gets the value for a plugin
   * @param {string} envKey - The key of the environment variable
   * @returns {boolean} The value for the plugin
   */
  getValueForPlugin(envKey) {
    const enterpriseKey = 'ENTERPRISE';

    this.assertEnvKey(enterpriseKey);
    this.assertEnvKey(envKey);

    if (this.isAvailableInENV(envKey)) {
      return this.getBoolean(envKey);
    }

    if (this.isAvailableInENV(enterpriseKey)) {
      return !this.getBoolean(enterpriseKey);
    }

    return this.getDefault(envKey);
  }
}

const handler = new ENVHandler(ENV.ENVHandlerCONST);

/**
 * Initializes the application
 * @param {Object} application - The application instance
 */
const initialize = (application) => {
  ENV.host = handler.getEnv('IRENE_API_HOST');
  ENV.isEnterprise = handler.getBoolean('ENTERPRISE');
  ENV.showLicense = handler.getBoolean('IRENE_SHOW_LICENSE');

  ENV.whitelabel = {
    ...ENV.whitelabel,
    enabled: handler.getBoolean('WHITELABEL_ENABLED'),
  };

  if (ENV.whitelabel.enabled) {
    ENV.whitelabel = {
      ...ENV.whitelabel,
      name: handler.getEnv('WHITELABEL_NAME'),
      logo: handler.getEnv('WHITELABEL_LOGO'),
      theme: handler.getEnv('WHITELABEL_THEME'),
      favicon: handler.getEnv('WHITELABEL_FAVICON'),
    };
  }

  ENV.enableHotjar = handler.getValueForPlugin('IRENE_ENABLE_HOTJAR');
  ENV.enablePendo = handler.getValueForPlugin('IRENE_ENABLE_PENDO');
  ENV.enableCSB = handler.getValueForPlugin('IRENE_ENABLE_CSB');
  ENV.enableMarketplace = handler.getValueForPlugin('IRENE_ENABLE_MARKETPLACE');
  ENV.emberRollbarClient = {
    enabled: handler.getValueForPlugin('IRENE_ENABLE_ROLLBAR'),
  };

  installPendo();
  installHotjar();
  customerSuccessBox();

  // Register ENV
  if (ENV.environment !== 'test') {
    application.register('env:main', ENV, {
      singleton: true,
      instantiate: false,
    });
  }
};

const IreneInitializer = {
  name: 'irene',
  initialize,
};

export { initialize };

export default IreneInitializer;
