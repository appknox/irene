import Component from '@glimmer/component';

export interface ProjectSettingsIntegrationsIntegratedUiSignature {
  Element: HTMLElement;
  Args: {
    imageSource: string;
    imageAlt: string;
    hostURL: string;
    username: string;
    onDisconnectClick(): void;
    loading?: boolean;
  };
}

export default class ProjectSettingsIntegrationsIntegratedUiComponent extends Component<ProjectSettingsIntegrationsIntegratedUiSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::IntegratedUi': typeof ProjectSettingsIntegrationsIntegratedUiComponent;
  }
}
