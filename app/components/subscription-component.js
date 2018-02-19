import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const SubscriptionComponentComponent = Ember.Component.extend({

  subscription: null,
  i18n: Ember.inject.service(),
  tSubscriptionCancelled: t("subscriptionCancelled"),

  isCancellingSubscription: false,

  isNotPerScan: Ember.computed.not('subscription.isPerScan'),

  confirmCallback() {
    const tSubscriptionCancelled = this.get("tSubscriptionCancelled");
    const that = this;
    const subscriptionId = this.get("subscription.id");
    const url = [ENV.endpoints.subscriptions, subscriptionId].join('/');
    this.set("isCancellingSubscription", true);
    this.get("ajax").delete(url)
    .then(function() {
      that.set("subscription.isCancelled", true);
      that.set("isCancellingSubscription", false);
      that.get("notify").success(tSubscriptionCancelled);
      that.send("closeCancelSubscriptionConfirmBox");
    })
    .catch(function(error) {
      that.set("isCancellingSubscription", false);
      that.get("notify").error(error.payload.message);
    });
  },

  actions: {

    openCancelSubscriptionConfirmBox() {
      this.set("showCancelSubscriptionConfirmBox", true);
    },

    closeCancelSubscriptionConfirmBox() {
      this.set("showCancelSubscriptionConfirmBox", false);
    }
  }
});

export default SubscriptionComponentComponent;
