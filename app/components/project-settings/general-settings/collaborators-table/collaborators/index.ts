import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

import ProjectModel from 'irene/models/project';
import ProjectCollaboratorModel from 'irene/models/project-collaborator';
import Store from 'ember-data/store';
import { tracked } from '@glimmer/tracking';
import OrganizationUserModel from 'irene/models/organization-user';

interface ProjectSettingsGeneralSettingsCollaboratorsTableCollaboratorsSignature {
  Args: {
    project: ProjectModel | null;
    collaborator: ProjectCollaboratorModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsCollaboratorsTableCollaboratorsComponent extends Component<ProjectSettingsGeneralSettingsCollaboratorsTableCollaboratorsSignature> {
  @service declare store: Store;

  @tracked orgMember: OrganizationUserModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsCollaboratorsTableCollaboratorsSignature['Args']
  ) {
    super(owner, args);

    this.fetchOrgMember.perform();
  }

  fetchOrgMember = task(async () => {
    this.orgMember = await this.store.findRecord(
      'organization-user',
      String(this.args.collaborator?.id)
    );
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/collaborators-table/collaborators': typeof ProjectSettingsGeneralSettingsCollaboratorsTableCollaboratorsComponent;
  }
}
