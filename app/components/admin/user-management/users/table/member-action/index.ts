import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import OrganizationMemberModel from 'irene/models/organization-member';

export interface AdminUserManagementUsersTableMemberActionSignature {
  Args: {
    member: OrganizationMemberModel;
  };
}

type MenuItem = {
  label: string;
  divider?: boolean;
  icon?: string;
  component: string;
};

export default class AdminUserManagementUsersTableMemberActionComponent extends Component<AdminUserManagementUsersTableMemberActionSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get menuItems() {
    return [
      {
        label: this.intl.t('resend'),
        icon: 'refresh',
        component:
          'admin/user-management/users/table/member-action/invite-resend',
        divider: true,
      },
      {
        label: this.intl.t('delete'),
        icon: 'delete',
        component:
          'admin/user-management/users/table/member-action/invite-delete',
        divider: true,
      },
      {
        label: this.intl.t('deactivate'),
        icon: 'person-off',
        component: 'admin/user-management/users/table/member-action/deactivate',
        divider: false,
      },
      // {
      //   label: this.intl.t('showDetails'),
      //   icon: 'description',
      //   component:
      //     'admin/user-management/users/table/member-action/showDetails',
      //   divider: true,
      // },
    ] as MenuItem[];
  }

  @action
  handleOpenMenu(event: MouseEvent) {
    event.stopPropagation();
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleCloseMenu() {
    this.anchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users::Table::MemberAction': typeof AdminUserManagementUsersTableMemberActionComponent;
  }
}
