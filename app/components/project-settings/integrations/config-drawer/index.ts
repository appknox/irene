import Component from '@glimmer/component';

export interface ProjectSettingsIntegrationsConfigDrawerSignature {
  Args: {
    openDrawer: boolean;
    drawerTitle: string;
    loadingDrawerSaveAction: boolean;
    drawerSaveAction(): void;
    closeDrawerHandler(): void;
    showDeleteButton?: boolean;
    noFooter?: boolean;
  };

  Blocks: { default: []; drawerContent: [] };
}

export default class ProjectSettingsIntegrationsConfigDrawerComponent extends Component<ProjectSettingsIntegrationsConfigDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::ConfigDrawer': typeof ProjectSettingsIntegrationsConfigDrawerComponent;
  }
}
