import Component from '@glimmer/component';

export interface ProjectSettingsIntegrationsIntegratedUiSignature {
  Element: HTMLElement;
  Args: {
    imageSource: string;
    imageAlt: string;
    hostURL?: string;
    propertyTitle: string;
    property: string;
    loading?: boolean;
    showEditButton?: boolean;
    onEditClick?: () => void;
  };
}

export default class ProjectSettingsIntegrationsIntegratedUiComponent extends Component<ProjectSettingsIntegrationsIntegratedUiSignature> {
  get onEditClick() {
    return this.args.onEditClick ?? (() => {});
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::IntegratedUi': typeof ProjectSettingsIntegrationsIntegratedUiComponent;
  }
}
