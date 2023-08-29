import Component from '@glimmer/component';
import OrganizationInvitationModel from 'irene/models/organization-invitation';
import OrganizationTeamInvitationModel from 'irene/models/organization-team-invitation';

export interface OrganizationInvitationListInvitedOnSignature {
  Args: {
    invitation: OrganizationInvitationModel | OrganizationTeamInvitationModel;
  };
  Element: HTMLElement;
}

export default class OrganizationInvitationListInvitedOn extends Component<OrganizationInvitationListInvitedOnSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'organization-invitation-list/invited-on': typeof OrganizationInvitationListInvitedOn;
    'OrganizationInvitationList::InvitedOn': typeof OrganizationInvitationListInvitedOn;
  }
}
