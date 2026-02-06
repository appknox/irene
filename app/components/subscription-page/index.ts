import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { service } from '@ember/service';

import type SubscriptionInfoModel from 'irene/models/subscription-info';
import type IntlService from 'ember-intl/services/intl';

export interface SubscriptionPageSignature {
  Args: {
    subscriptionInfo: SubscriptionInfoModel;
  };
}

export default class SubscriptionPageComponent extends Component<SubscriptionPageSignature> {
  @service declare intl: IntlService;

  get subscriptionInfo() {
    return this.args.subscriptionInfo;
  }

  get startDate() {
    if (!this.subscriptionInfo?.startDate) {
      return '-';
    }

    return dayjs(this.subscriptionInfo.startDate).format('MMM DD, YYYY');
  }

  get expiryDate() {
    if (!this.subscriptionInfo?.expiryDate) {
      return '-';
    }
    return dayjs(this.subscriptionInfo.expiryDate).format('MMM DD, YYYY');
  }

  get subscriptionItems() {
    return [
      {
        label: this.intl.t('subscriptionStartDate'),
        value: this.startDate,
      },
      {
        label: this.intl.t('subscriptionEndDate'),
        value: this.expiryDate,
      },
      {
        label: this.intl.t('licensesProcured'),
        value: this.subscriptionInfo?.originalLicenses ?? '-',
      },
      {
        label: this.intl.t('licensesRemaining'),
        value: this.subscriptionInfo?.licensesRemaining ?? '-',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SubscriptionPage: typeof SubscriptionPageComponent;
  }
}
