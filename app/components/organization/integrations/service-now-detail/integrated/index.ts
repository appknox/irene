import Component from '@glimmer/component';

export interface OrganizationIntegrationsServiceNowDetailIntegratedSignature {
  Args: {
    instanceURL: string;
    username: string;
    tableName: string;
    autoPush: boolean;
  };
}

export default class OrganizationIntegrationsServiceNowDetailIntegratedComponent extends Component<OrganizationIntegrationsServiceNowDetailIntegratedSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ServiceNowDetail::Integrated': typeof OrganizationIntegrationsServiceNowDetailIntegratedComponent;
  }
}
