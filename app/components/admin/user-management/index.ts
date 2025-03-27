import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type UserModel from 'irene/models/user';

export interface AdminUserManagementComponentSignature {
  Args: {
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class AdminUserManagementComponent extends Component<AdminUserManagementComponentSignature> {
  @service declare intl: IntlService;

  get tabItems() {
    return [
      {
        id: 'users',
        route: 'authenticated.admin.user-management.users',
        label: this.intl.t('users'),
      },
      {
        id: 'email-domain-restrictions',
        route: 'authenticated.admin.user-management.email-domain-restrictions',
        label: this.intl.t('emailDomainRestrictions'),
      },
    ].filter(Boolean);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement': typeof AdminUserManagementComponent;
  }
}
