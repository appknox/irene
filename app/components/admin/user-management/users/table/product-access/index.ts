import { service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import OrganizationMemberModel from 'irene/models/organization-member';
import OrganizationService from 'irene/services/organization';

export interface AdminUserManagementUsersTableProductAccessSignature {
  Element: HTMLElement;
  Args: {
    user: OrganizationMemberModel;
    loading: boolean;
  };
}

export default class AdminUserManagementUsersTableProductAccessComponent extends Component<AdminUserManagementUsersTableProductAccessSignature> {
  @service declare organization: OrganizationService;
  @service declare intl: IntlService;

  get user() {
    return this.args.user;
  }

  get isStoreknoxEnabled() {
    return this.organization?.selected?.features?.storeknox;
  }

  get userIsDisabled() {
    return this.user?.member?.get('isActive');
  }

  get userProductIcon() {
    return [
      'ak-svg/vapt-indicator' as const,
      'ak-svg/vapt-sox-icon' as const,
      'ak-svg/sox-icon' as const,
      'ak-svg/vapt-sox-pending-icon' as const,
      'ak-svg/vapt-sox-disabled-icon' as const,
      'ak-svg/sox-disabled-icon' as const,
    ][Math.floor(Math.random() * 5)]; // Todo: remove this randomization
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users::Table::ProductAccess': typeof AdminUserManagementUsersTableProductAccessComponent;
  }
}
