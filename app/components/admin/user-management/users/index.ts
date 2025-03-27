import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type UserModel from 'irene/models/user';
import type OrganizationService from 'irene/services/organization';
import type OrganizationModel from 'irene/models/organization';
import { OrganizationMembersRouteQueryParams } from 'irene/routes/authenticated/admin/user-management/users';

export interface AdminUserManagementUsersComponentSignature {
  Args: {
    user: UserModel;
    organization: OrganizationModel;
    queryParams: OrganizationMembersRouteQueryParams;
  };
  Blocks: {
    default: [];
  };
}

export default class AdminUserManagementUsersComponent extends Component<AdminUserManagementUsersComponentSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;

  get usersData() {
    return [
      {
        id: 'total',
        label: this.intl.t('totalUsers'),
        value: this.organization.selected?.membersCount,
      },
      {
        id: 'active',
        label: this.intl.t('activeUsers'),
        value: '04',
      },
      {
        id: 'deactivated',
        label: this.intl.t('deactivatedUsers'),
        value: '01',
      },
      {
        id: 'pendingInvites',
        label: this.intl.t('pendingInvitations'),
        value: '02',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users': typeof AdminUserManagementUsersComponent;
  }
}
