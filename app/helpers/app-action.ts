import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const appAction = function (params: [string | number]) {
  const currentAppAction = parseInt(String(params[0]));

  if (currentAppAction === ENUMS.APP_ACTION.NO_PREFERENCE) {
    return 'noPreference' as const;
  } else if (currentAppAction === ENUMS.APP_ACTION.HALT) {
    return 'halt' as const;
  } else if (currentAppAction === ENUMS.APP_ACTION.PROCEED) {
    return 'proceed' as const;
  } else {
    return 'noPreference' as const;
  }
};

const AppActionHelper = helper(appAction);

export { appAction };

export default AppActionHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'app-action': typeof AppActionHelper;
  }
}
