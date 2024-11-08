import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import OrganizationProjectModel from 'irene/models/organization-project';
import ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

export interface OrganizationTeamProjectListProjectInfoComponentSignature {
  Args: {
    project: OrganizationProjectModel;
  };
}

export default class OrganizationTeamProjectListProjectInfo extends Component<OrganizationTeamProjectListProjectInfoComponentSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked teamProject: ProjectModel | null = null;

  constructor(
    owner: object,
    args: OrganizationTeamProjectListProjectInfoComponentSignature['Args']
  ) {
    super(owner, args);

    this.fetchProjectDetail.perform();
  }

  fetchProjectDetail = task(async () => {
    try {
      this.teamProject = await this.store.findRecord(
        'project',
        this.args.project.id
      );
    } catch (e) {
      this.notify.error(parseError(e));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::ProjectList::ProjectInfo': typeof OrganizationTeamProjectListProjectInfo;
  }
}
