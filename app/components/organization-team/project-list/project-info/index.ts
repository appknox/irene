import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import OrganizationProjectModel from 'irene/models/organization-project';

export interface OrganizationTeamProjectListProjectInfoComponentSignature {
  Args: {
    project: OrganizationProjectModel;
  };
}

export default class OrganizationTeamProjectListProjectInfo extends Component<OrganizationTeamProjectListProjectInfoComponentSignature> {
  @service declare store: Store;

  get teamProject() {
    return this.store.findRecord('project', this.args.project.id);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::ProjectList::ProjectInfo': typeof OrganizationTeamProjectListProjectInfo;
  }
}
