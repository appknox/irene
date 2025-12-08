import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type SubscriptionModel from 'irene/models/subscription';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

interface OrganizationBillingSubscriptionSignature {
  Args: {
    subscription?: SubscriptionModel;
  };
}

export default class OrganizationBillingSubscriptionComponent extends Component<OrganizationBillingSubscriptionSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked showCancelSubscriptionConfirmBox = false;

  get isNotPerScan() {
    return !this.args.subscription?.isPerScan;
  }

  get columns() {
    return [
      {
        name: this.intl.t('subscriptionDetails'),
        textAlign: 'center',
      },
    ];
  }

  get rows() {
    return [
      {
        label: this.intl.t('currentPlan'),
        value: this.args.subscription?.planName,
      },
      {
        label: this.intl.t('billingPeriod'),
        value: this.args.subscription?.billingPeriodText,
      },
    ];
  }

  @action
  openCancelSubscriptionConfirmBox() {
    this.showCancelSubscriptionConfirmBox = true;
  }

  @action
  closeCancelSubscriptionConfirmBox() {
    this.showCancelSubscriptionConfirmBox = false;
  }

  confirmCancelSubscription = task(async () => {
    const tSubscriptionCancelled = this.intl.t('subscriptionCancelled');
    const subscriptionId = this.args.subscription?.id;

    const url = [ENV.endpoints['subscriptions'], subscriptionId].join('/');

    try {
      await this.ajax.delete(url);

      this.notify.success(tSubscriptionCancelled);

      if (!this.isDestroyed) {
        this.args.subscription?.set('isCancelled', true);

        this.closeCancelSubscriptionConfirmBox();
      }

      this.analytics.track({
        name: 'ORG_SUBSCRIPTION_CANCEL_EVENT',
        properties: {
          feature: 'subscription_cancellation',
        },
      });
    } catch (err) {
      const error = err as AjaxError;

      if (!this.isDestroyed) {
        this.notify.error(error.payload.message);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationBilling::Subscription': typeof OrganizationBillingSubscriptionComponent;
  }
}
