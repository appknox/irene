import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';

export interface OrganizationServiceAccountListExpiryOnSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
  };
}

export default class OrganizationServiceAccountListExpiryOnComponent extends Component<OrganizationServiceAccountListExpiryOnSignature> {
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
    'Organization::ServiceAccount::List::ExpiryOn': typeof OrganizationServiceAccountListExpiryOnComponent;
    'organization/service-account/list/expiry-on': typeof OrganizationServiceAccountListExpiryOnComponent;
  }
}
