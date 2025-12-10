import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const appEnvironment = function (params: [string | number]) {
  const currentAppEnv = parseInt(String(params[0]));

  if (currentAppEnv === ENUMS.APP_ENV.NO_PREFERENCE) {
    return 'noPreference' as const;
  } else if (currentAppEnv === ENUMS.APP_ENV.STAGING) {
    return 'staging' as const;
  } else if (currentAppEnv === ENUMS.APP_ENV.PRODUCTION) {
    return 'production' as const;
  } else {
    return 'noPreference' as const;
  }
};

const AppEnvironmentHelper = helper(appEnvironment);

export { appEnvironment };

export default AppEnvironmentHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'app-environment': typeof AppEnvironmentHelper;
  }
}
