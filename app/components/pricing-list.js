import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

const PricingListComponent = Ember.Component.extend({

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY,

  subscriptions: (function() {
    let subscriptions;
    const that = this;
    subscriptions = this.get("store").findAll("subscription")
      .then(function(data){
        that.set("subscriptions", data);
        if (data.isLoaded === true) {
          const plans = that.get("store").findAll("plan");
          that.set("plans", plans);
        }});
  }).property(),

  subscription: Ember.computed.alias('subscriptions.firstObject'),

  subscriptionCount: Ember.computed.alias('subscriptions.length'),

  hasSubscription: Ember.computed.gt('subscriptionCount', 0),

  hasNoSubscription: Ember.computed.equal('subscriptionCount', 0),

  sortPlanProperties: ['id'],
  sortedPlans: Ember.computed.sort('plans', 'sortPlanProperties'),

  durations: (function() {
    const durations = ENUMS.PAYMENT_DURATION.CHOICES;
    return durations.slice(0, +(durations.length-2) + 1 || undefined);
  }).property(),

  activateDuration(element) {
    $(".js-duration-button").removeClass("is-primary is-active");
    $(".js-duration-button").addClass("is-default");
    $(element).removeClass("is-default");
    $(element).addClass("is-primary is-active");
  },

  didRender() {
    const paymentDuration = this.get("paymentDuration");
    const element = $(this.element).find(`[data-value='${paymentDuration}']`);
    this.activateDuration(element);
  },

  devknoxPricing: (function() {
    const store = this.get("store");
    return store.createRecord("pricing", {
      id: "devknox",
      name: "Devknox",
      description: "Dashboard Upload, Manual Scan",
      price: ENV.devknoxPrice,
      projectsLimit: 0,
    });
  }).property(),

  actions: {
    selectDuration() {
      this.set("paymentDuration", $(event.srcElement).data("value"));
      this.activateDuration(event.srcElement);
    }
  }
});

export default PricingListComponent;
