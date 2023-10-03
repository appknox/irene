import Component from '@glimmer/component';

import ProjectTeamModel from 'irene/models/project-team';
import ProjectModel from 'irene/models/project';

interface ProjectSettingsGeneralSettingsProjectTeamTableTeamsSignature {
  Args: {
    project: ProjectModel | null;
    team: ProjectTeamModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsProjectTeamTableTeamsComponent extends Component<ProjectSettingsGeneralSettingsProjectTeamTableTeamsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/project-team-table/teams': typeof ProjectSettingsGeneralSettingsProjectTeamTableTeamsComponent;
  }
}
