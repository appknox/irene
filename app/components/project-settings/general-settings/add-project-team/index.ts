import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import ProjectModel from 'irene/models/project';
import MeService from 'irene/services/me';

interface ProjectSettingsGeneralSettingsAddProjectTeamSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectTeamComponent extends Component<ProjectSettingsGeneralSettingsAddProjectTeamSignature> {
  @service declare me: MeService;

  @tracked showAddProjectTeamModal = false;

  get project() {
    return this.args.project;
  }

  @action openAddTeamModal() {
    this.showAddProjectTeamModal = true;
  }

  @action closeAddTeamModal() {
    this.showAddProjectTeamModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::AddProjectTeam': typeof ProjectSettingsGeneralSettingsAddProjectTeamComponent;
  }
}
