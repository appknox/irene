import Component from '@glimmer/component';

interface OrganizationIntegrationsCardSignature {
  Args: {
    data: {
      id: string;
      title: string;
      description: string;
      logo: string;
      isIntegrated: boolean;
      showSelectBtn?: boolean;
      selectBtnText?: string;
    };
    loading?: boolean;
    onIntegrateClick: () => void;
  };
}

export default class OrganizationIntegrationsCardComponent extends Component<OrganizationIntegrationsCardSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::Card': typeof OrganizationIntegrationsCardComponent;
  }
}
