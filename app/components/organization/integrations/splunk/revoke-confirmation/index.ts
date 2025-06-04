import Component from '@glimmer/component';

export interface OrganizationIntegrationsSplunkRevokeConfirmationSignature {
  Element: HTMLElement;
  Args: {
    onCancel: () => void;
    onConfirm: () => void;
    isRevoking: boolean;
  };
}

export default class OrganizationIntegrationsSplunkRevokeConfirmationComponent extends Component<OrganizationIntegrationsSplunkRevokeConfirmationSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::Splunk::RevokeConfirmation': typeof OrganizationIntegrationsSplunkRevokeConfirmationComponent;
  }
}
