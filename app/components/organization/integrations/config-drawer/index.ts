import Component from '@glimmer/component';

export interface OrganizationIntegrationsConfigDrawerSignature {
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

export default class OrganizationIntegrationsConfigDrawerComponent extends Component<OrganizationIntegrationsConfigDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ConfigDrawer': typeof OrganizationIntegrationsConfigDrawerComponent;
  }
}
