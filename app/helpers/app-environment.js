/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const appEnvironment = function(params) {

  const currentAppEnv = parseInt(params[0]);

  if (currentAppEnv === ENUMS.APP_ENV.NO_PREFERENCE) {
    return "noPreference";
  } else if (currentAppEnv === ENUMS.APP_ENV.STAGING) {
    return "staging";
  } else if (currentAppEnv === ENUMS.APP_ENV.PRODUCTION) {
    return "production";
  } else {
    return "noPreference";
  }
};

const AppEnvironmentHelper = helper(appEnvironment);

export { appEnvironment };

export default AppEnvironmentHelper;
