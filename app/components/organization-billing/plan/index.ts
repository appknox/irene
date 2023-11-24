import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import PlanModel from 'irene/models/plan';

interface OrganizationBillingPlanSignature {
  Args: {
    plan: PlanModel;
    paymentDuration: number;
  };
}

export default class OrganizationBillingPlanComponent extends Component<OrganizationBillingPlanSignature> {
  @service declare intl: IntlService;
  @service('browser/window') declare window: Window;

  @tracked planQuantity = 1;

  get planText() {
    const tApp = this.intl.t('appOrS');
    const tScan = this.intl.t('scan');

    const planId = this.args.plan.planId;

    if (planId === 'default_per_scan') {
      return tScan;
    }

    return tApp;
  }

  get updatedPrice() {
    const planPrice = this.planPaymentMetaData?.price || 0;
    const planQuantity = this.planQuantity;

    const totalPrice = planPrice * planQuantity;

    return `Pay $${totalPrice} USD`;
  }

  get planPaymentMetaData() {
    const duration = this.args.paymentDuration;

    switch (duration) {
      case ENUMS.PAYMENT_DURATION.MONTHLY:
        return {
          price: this.args.plan.monthlyPrice,
          url: this.args.plan.monthlyUrl,
        };

      case ENUMS.PAYMENT_DURATION.QUARTERLY:
        return {
          price: this.args.plan.quarterlyPrice,
          url: this.args.plan.quarterlyUrl,
        };

      case ENUMS.PAYMENT_DURATION.HALFYEARLY:
        return {
          price: this.args.plan.halfYearlyPrice,
          url: this.args.plan.halfYearlyUrl,
        };

      case ENUMS.PAYMENT_DURATION.YEARLY:
        return {
          price: this.args.plan.yearlyPrice,
          url: this.args.plan.yearlyUrl,
        };
    }

    return null;
  }

  @action
  initiatePayment() {
    const url = this.planPaymentMetaData?.url;

    if (url) {
      const updatedUrl = [
        url,
        `subscription[plan_quantity]=${this.planQuantity}`,
      ].join('&');

      if (ENV.environment === 'production') {
        this.window.location.href = updatedUrl;
      }
    }
  }

  @action
  incrementPlanQuantity() {
    this.planQuantity++;
  }

  @action
  decrementPlanQuantity() {
    if (this.planQuantity > 1) {
      this.planQuantity--;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationBilling::Plan': typeof OrganizationBillingPlanComponent;
  }
}
