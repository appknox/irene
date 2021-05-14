import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

const PricingPlanComponent = Component.extend({

  plan: null,
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY,
  classNames: ["column", "is-one-third"],
  planQuantity: 1,
  intl: service(),

  tApp: t("appOrS"),
  tScan: t("scan"),

  planText: computed('plan.planId', 'tApp', 'tScan', function() {
    const tApp = this.get("tApp");
    const tScan = this.get("tScan");
    const planId = this.get("plan.planId");
    if (planId === "default_per_scan") {
      return tScan;
    }
    return tApp;
  }),

  updatedPrice: computed('totalPrice', 'planQuantity', function() {
    const totalPrice = this.get("totalPrice");
    const planQuantity = this.get("planQuantity");
    const updatedPrice = totalPrice * planQuantity;
    return `Pay $${updatedPrice} USD`;
  }),

  totalPrice: computed("paymentDuration", "plan.{monthlyPrice,quarterlyPrice,halfYearlyPrice,yearlyPrice}", function() {
    let price;
    const duration = this.get("paymentDuration");
    switch (duration) {
      case ENUMS.PAYMENT_DURATION.MONTHLY:
        price = this.get("plan.monthlyPrice");
        break;
      case ENUMS.PAYMENT_DURATION.QUARTERLY:
        price = this.get("plan.quarterlyPrice");
        break;
      case ENUMS.PAYMENT_DURATION.HALFYEARLY:
        price = this.get("plan.halfYearlyPrice");
        break;
      case ENUMS.PAYMENT_DURATION.YEARLY:
        price = this.get("plan.yearlyPrice");
        break;
    }
    return price;
  }),

  actions: {

    initiatePayment() {
      let url;
      const duration = this.get("paymentDuration");
      const planQuantity = this.get("planQuantity");
      switch (duration) {
        case ENUMS.PAYMENT_DURATION.MONTHLY:
          url = this.get("plan.monthlyUrl");
          break;
        case ENUMS.PAYMENT_DURATION.QUARTERLY:
          url = this.get("plan.quarterlyUrl");
          break;
        case ENUMS.PAYMENT_DURATION.HALFYEARLY:
          url = this.get("plan.halfYearlyUrl");
          break;
        case ENUMS.PAYMENT_DURATION.YEARLY:
          url = this.get("plan.yearlyUrl");
          break;
      }
      const updatedUrl = [url, `subscription[plan_quantity]=${planQuantity}`].join('&');
      if (ENV.environment === "production") {
        window.location = updatedUrl;
      }
    },

    incrementPlanQuantity() {
      this.incrementProperty("planQuantity");
    },

    decrementPlanQuantity() {
      const planQuantity = this.get("planQuantity");
      if (planQuantity > 1) {
        this.decrementProperty("planQuantity");
      }
    }
  }
});


export default PricingPlanComponent;
