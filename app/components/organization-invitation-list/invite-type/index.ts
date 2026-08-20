import Component from '@glimmer/component';
import type OrganizationInvitationModel from 'irene/models/organization-invitation';
import type OrganizationTeamInvitationModel from 'irene/models/organization-team-invitation';

export interface OrganizationInvitationListInviteTypeSignature {
  Args: {
    invitation: OrganizationInvitationModel | OrganizationTeamInvitationModel;
  };
  Element: HTMLElement;
}

export default class OrganizationInvitationListInviteType extends Component<OrganizationInvitationListInviteTypeSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'organization-invitation-list/invite-type': typeof OrganizationInvitationListInviteType;
    'OrganizationInvitationList::InviteType': typeof OrganizationInvitationListInviteType;
  }
}
