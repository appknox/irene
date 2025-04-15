import Component from '@glimmer/component';

import type ServiceAccountModel from 'irene/models/service-account';

export interface AdminServiceAccountListExpiryOnSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    onMoreMenuClick: (
      serviceAccount: ServiceAccountModel,
      event: MouseEvent
    ) => void;
  };
}

export default class AdminServiceAccountListExpiryOnComponent extends Component<AdminServiceAccountListExpiryOnSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::List::Action': typeof AdminServiceAccountListExpiryOnComponent;
    'admin/service-account/list/action': typeof AdminServiceAccountListExpiryOnComponent;
  }
}
