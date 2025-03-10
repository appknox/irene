import Component from '@glimmer/component';
import type JiraRepoModel from 'irene/models/jira-repo';

export interface ProjectSettingsIntegrationsJiraProjectSelectedProjectSignature {
  Args: {
    currentJiraProject: JiraRepoModel;
  };
}

export default class ProjectSettingsIntegrationsJiraProjectSelectedProjectComponent extends Component<ProjectSettingsIntegrationsJiraProjectSelectedProjectSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::JiraProject::SelectedProject': typeof ProjectSettingsIntegrationsJiraProjectSelectedProjectComponent;
  }
}
