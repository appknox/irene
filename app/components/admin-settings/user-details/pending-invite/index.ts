import Component from '@glimmer/component';
import type OrganizationMemberModel from 'irene/models/organization-member';

interface AdminSettingsUserDetailsHeaderSignature {
  Element: HTMLElement;
  Args: {
    member?: OrganizationMemberModel;
  };
}

export default class AdminSettingsUserDetailsPendingInviteComponent extends Component<AdminSettingsUserDetailsHeaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::PendingInvite': typeof AdminSettingsUserDetailsPendingInviteComponent;
  }
}
