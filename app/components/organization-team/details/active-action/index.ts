import Component from '@glimmer/component';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationModel from 'irene/models/organization';

export interface ActionContentType {
  action: () => void;
  actionLabel: string;
  actionRunning: boolean;
  actionDisabled: boolean;
}

export interface ActiveActionDetailsType {
  component:
    | 'invite-member'
    | 'organization-team/edit-team-name'
    | 'organization-team/add-team-member'
    | 'organization-team/add-team-project';
}

export interface OrganizationTeamDetailsActiveActionComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel;
    cancelActiveAction: () => void;
    activeActionDetails: ActiveActionDetailsType | null;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamDetailsActiveActionComponent extends Component<OrganizationTeamDetailsActiveActionComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::Details::ActiveAction': typeof OrganizationTeamDetailsActiveActionComponent;
  }
}
