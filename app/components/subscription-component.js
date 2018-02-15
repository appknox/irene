import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const SubscriptionComponentComponent = Ember.Component.extend({

  subscription: null,
  i18n: Ember.inject.service(),
  tSubscriptionCancelled: t("subscriptionCancelled"),

  isNotPerScan: Ember.computed.not('subscription.isPerScan'),

  confirmCallback() {
    const tSubscriptionCancelled = this.get("tSubscriptionCancelled");
    const that = this;
    const subscription = this.get("subscription");
    const subscriptionId = this.get("subscription.id");
    const url = [ENV.endpoints.subscriptions, subscriptionId].join('/');
    this.get("ajax").delete(url)
    .then(data => that.set("subscription.isCancelled", true))
    .then(function(data) {
      that.get("notify").success(tSubscriptionCancelled);
      that.send("closeCancelSubscriptionConfirmBox");
    })
    .catch(function(error) {
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
