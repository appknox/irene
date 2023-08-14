import Component from '@glimmer/component';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';

export interface OrganizationNamespaceComponentSignature {
  Args: {
    namespace: OrganizationNamespaceModel;
  };
  Element: HTMLElement;
}

export default class OrganizationNamespaceValueComponent extends Component<OrganizationNamespaceComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationNamespace::NamespaceValue': typeof OrganizationNamespaceValueComponent;
  }
}
