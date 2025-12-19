/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const appAction = function(params) {

  const currentAppAction = parseInt(params[0]);

  if (currentAppAction === ENUMS.APP_ACTION.NO_PREFERENCE) {
    return "noPreference";
  } else if (currentAppAction === ENUMS.APP_ACTION.HALT) {
    return "halt";
  } else if (currentAppAction === ENUMS.APP_ACTION.PROCEED) {
    return "proceed";
  } else {
    return "noPreference";
  }
};

const AppActionHelper = helper(appAction);

export { appAction };

export default AppActionHelper;
