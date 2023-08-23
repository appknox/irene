import Component from '@glimmer/component';
import OrganizationProjectModel from 'irene/models/organization-project';

export interface OrganizationTeamProjectListProjectInfoComponentSignature {
  Args: {
    project: OrganizationProjectModel;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamProjectListProjectInfoComponent extends Component<OrganizationTeamProjectListProjectInfoComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::AddTeamProject::ProjectInfo': typeof OrganizationTeamProjectListProjectInfoComponent;
  }
}
