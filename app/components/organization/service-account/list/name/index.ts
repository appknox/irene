import Component from '@glimmer/component';

import type ServiceAccountModel from 'irene/models/service-account';

export interface OrganizationServiceAccountListNameSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
  };
}

export default class OrganizationServiceAccountListNameComponent extends Component<OrganizationServiceAccountListNameSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::List::Name': typeof OrganizationServiceAccountListNameComponent;
    'organization/service-account/list/name': typeof OrganizationServiceAccountListNameComponent;
  }
}
