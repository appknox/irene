import Component from '@ember/component';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import $ from 'jquery';

const PricingListComponent = Component.extend({

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY,

  subscriptions: computed('store', function() {
    this.get("store").findAll("subscription")
    .then((data) => {
      this.set("subscriptions", data); // eslint-disable-line
      if (data.isLoaded === true) {
        const plans = this.get("store").findAll("plan");
        this.set("plans", plans); // eslint-disable-line
      }
    });
  }),

  subscription: computed.alias('subscriptions.firstObject'),

  subscriptionCount: computed.alias('subscriptions.length'),

  hasSubscription: computed.gt('subscriptionCount', 0),

  hasNoSubscription: computed.equal('subscriptionCount', 0),

  sortPlanProperties: ['id'],
  sortedPlans: computed.sort('plans', 'sortPlanProperties'),

  durations: computed(function() {
    const durations = ENUMS.PAYMENT_DURATION.CHOICES;
    return durations.slice(0, +(durations.length-2) + 1 || undefined);
  }),

  activateDuration(element) {
    $(".js-duration-button").removeClass("is-primary is-active");
    $(".js-duration-button").addClass("is-default");
    $(element).removeClass("is-default");
    $(element).addClass("is-primary is-active");
  },

  didRender() {
this._super(...arguments);
    const paymentDuration = this.get("paymentDuration");
    // eslint-disable-next-line no-undef
    const element = $(this.element).find(`[data-value='${paymentDuration}']`);
    this.activateDuration(element);
  },

  actions: {
    selectDuration() {
      // eslint-disable-next-line no-undef
      this.set("paymentDuration", $(event.srcElement).data("value"));
      this.activateDuration(event.srcElement);
    }
  }
});

export default PricingListComponent;
