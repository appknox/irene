import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import MeService from 'irene/services/me';
import OrganizationMemberModel from 'irene/models/organization-member';

interface AdminUserManagementUsersTableMemberInfoSignature {
  Args: {
    member: OrganizationMemberModel;
  };
  Element: HTMLElement;
}

export default class AdminUserManagementUsersTableMemberInfoComponent extends Component<AdminUserManagementUsersTableMemberInfoSignature> {
  @service declare me: MeService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AdminUserManagementUsersTableMemberInfo: typeof AdminUserManagementUsersTableMemberInfoComponent;
  }
}
