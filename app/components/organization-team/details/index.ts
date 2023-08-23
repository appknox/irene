import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationModel from 'irene/models/organization';
import { ActiveActionDetailsType } from './active-action';

export interface OrganizationTeamDetailsComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel;
    showTeamDetail: boolean;
    handleTeamDetailClose: () => void;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamDetails extends Component<OrganizationTeamDetailsComponentSignature> {
  @tracked activeActionDetails: ActiveActionDetailsType | null = null;

  @action
  handleActiveAction(details: ActiveActionDetailsType) {
    this.activeActionDetails = details;
  }

  @action
  cancelActiveAction() {
    this.activeActionDetails = null;
  }

  @action
  handleDrawerClose() {
    this.args.handleTeamDetailClose();
    this.cancelActiveAction();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::Details': typeof OrganizationTeamDetails;
  }
}
