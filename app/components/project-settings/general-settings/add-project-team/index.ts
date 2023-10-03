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

  @tracked showAddProjectTeamDrawer = false;

  get project() {
    return this.args.project;
  }

  @action openAddTeamDrawer() {
    this.showAddProjectTeamDrawer = true;
  }

  @action closeAddTeamDrawer() {
    this.showAddProjectTeamDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::AddProjectTeam': typeof ProjectSettingsGeneralSettingsAddProjectTeamComponent;
  }
}
