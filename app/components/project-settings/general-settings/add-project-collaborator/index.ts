import Component from '@glimmer/component';
import { action } from '@ember/object';

import ProjectModel from 'irene/models/project';
import { tracked } from '@glimmer/tracking';
import MeService from 'irene/services/me';
import { inject as service } from '@ember/service';

interface ProjectSettingsGeneralSettingsAddProjectCollaboratorSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectCollaboratorComponent extends Component<ProjectSettingsGeneralSettingsAddProjectCollaboratorSignature> {
  @service declare me: MeService;

  @tracked showAddProjectCollaboratorDrawer = false;

  get project() {
    return this.args.project;
  }

  @action openAddCollaboratorDrawer() {
    this.showAddProjectCollaboratorDrawer = true;
  }

  @action closeAddCollaboratorDrawer() {
    this.showAddProjectCollaboratorDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::AddProjectCollaborator': typeof ProjectSettingsGeneralSettingsAddProjectCollaboratorComponent;
  }
}
