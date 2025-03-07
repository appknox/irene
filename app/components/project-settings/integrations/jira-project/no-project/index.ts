import Component from '@glimmer/component';

export interface ProjectSettingsIntegrationsJiraProjectNoProjectSignature {
  Args: {
    reconnect: boolean;
  };
}

export default class ProjectSettingsIntegrationsJiraProjectNoProjectComponent extends Component<ProjectSettingsIntegrationsJiraProjectNoProjectSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::JiraProject::NoProject': typeof ProjectSettingsIntegrationsJiraProjectNoProjectComponent;
  }
}
