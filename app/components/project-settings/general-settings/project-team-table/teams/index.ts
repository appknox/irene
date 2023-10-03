import Component from '@glimmer/component';
import ProjectTeamModel from 'irene/models/project-team';

interface ProjectSettingsGeneralSettingsProjectTeamTableTeamsSignature {
  Args: {
    team: ProjectTeamModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsProjectTeamTableTeamsComponent extends Component<ProjectSettingsGeneralSettingsProjectTeamTableTeamsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/project-team-table/teams': typeof ProjectSettingsGeneralSettingsProjectTeamTableTeamsComponent;
  }
}
