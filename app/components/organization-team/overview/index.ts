import Component from '@glimmer/component';
import { action } from '@ember/object';
import type OrganizationTeamModel from 'irene/models/organization-team';
import type OrganizationModel from 'irene/models/organization';

export interface OrganizationTeamOverviewComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel | null;
    showTeamDetails: (team: OrganizationTeamModel) => void;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamOverview extends Component<OrganizationTeamOverviewComponentSignature> {
  @action
  showTeamDetails() {
    this.args.showTeamDetails(this.args.team);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::Overview': typeof OrganizationTeamOverview;
  }
}
