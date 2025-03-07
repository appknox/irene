import Component from '@glimmer/component';

export default class ProjectSettingsIntegrationsLoadingUiComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::LoadingUi': typeof ProjectSettingsIntegrationsLoadingUiComponent;
  }
}
