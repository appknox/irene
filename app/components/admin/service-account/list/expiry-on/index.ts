import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';

export interface AdminServiceAccountListExpiryOnSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
  };
}

export default class AdminServiceAccountListExpiryOnComponent extends Component<AdminServiceAccountListExpiryOnSignature> {
  @service declare intl: IntlService;

  get expiryChipDetails() {
    const serviceAccount = this.args.serviceAccount;
    const noExpiry = serviceAccount.expiry === null;

    return {
      label: noExpiry
        ? this.intl.t('noExpiry')
        : dayjs(serviceAccount.expiry).format('DD MMM YYYY'),
      icon: noExpiry ? 'warning' : 'event',
      color: noExpiry ? ('warn' as const) : ('default' as const),
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::List::ExpiryOn': typeof AdminServiceAccountListExpiryOnComponent;
    'admin/service-account/list/expiry-on': typeof AdminServiceAccountListExpiryOnComponent;
  }
}
