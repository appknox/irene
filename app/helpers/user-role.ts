/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function userRole(params: number[]) {

  const currentRole = params[0];

  if (currentRole === ENUMS.ORGANIZATION_ROLES.MEMBER) {
    return "memberRole";
  } else if (currentRole === ENUMS.ORGANIZATION_ROLES.OWNER) {
    return "owner";
  } else if (currentRole === ENUMS.ORGANIZATION_ROLES.ADMIN) {
    return "admin";
  }
}

export default helper(userRole);

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'user-role': typeof userRole;
  }
}