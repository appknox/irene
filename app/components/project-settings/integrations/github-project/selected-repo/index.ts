import Component from '@glimmer/component';
import type GithubRepoModel from 'irene/models/github-repo';

export interface ProjectSettingsIntegrationsGithubProjectSelectedRepoSignature {
  Args: {
    currentGithubRepo: GithubRepoModel;
  };
}

export default class ProjectSettingsIntegrationsGithubProjectSelectedRepoComponent extends Component<ProjectSettingsIntegrationsGithubProjectSelectedRepoSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::GithubProject::SelectedRepo': typeof ProjectSettingsIntegrationsGithubProjectSelectedRepoComponent;
  }
}
