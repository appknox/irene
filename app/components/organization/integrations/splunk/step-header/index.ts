import Component from '@glimmer/component';

export interface OrganizationIntegrationsSplunkStepHeaderSignature {
  Element: HTMLElement;
  Args: {
    isStep2: boolean;
    onGoBack: () => void;
  };
}

export default class OrganizationIntegrationsSplunkStepHeaderComponent extends Component<OrganizationIntegrationsSplunkStepHeaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::Splunk::StepHeader': typeof OrganizationIntegrationsSplunkStepHeaderComponent;
  }
}
