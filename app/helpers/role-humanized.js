/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const roleHumanized = function(params) {

  const currentRole = params[0];

  if (currentRole === ENUMS.COLLABORATION_ROLE.ADMIN) {
    return "admin";
  } else if (currentRole === ENUMS.COLLABORATION_ROLE.MANAGER) {
    return "manager";
  } else if (currentRole === ENUMS.COLLABORATION_ROLE.READ_ONLY) {
    return "developer";
  } else {
    return "changeRole";
  }
};

const RoleHumanizedHelper = Ember.Helper.helper(roleHumanized);

export { roleHumanized };

export default RoleHumanizedHelper;
