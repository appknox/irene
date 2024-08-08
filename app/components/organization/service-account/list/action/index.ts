import Component from '@glimmer/component';

import type ServiceAccountModel from 'irene/models/service-account';

export interface OrganizationServiceAccountListExpiryOnSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    onMoreMenuClick: (
      serviceAccount: ServiceAccountModel,
      event: MouseEvent
    ) => void;
  };
}

export default class OrganizationServiceAccountListExpiryOnComponent extends Component<OrganizationServiceAccountListExpiryOnSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::List::Action': typeof OrganizationServiceAccountListExpiryOnComponent;
    'organization/service-account/list/action': typeof OrganizationServiceAccountListExpiryOnComponent;
  }
}
