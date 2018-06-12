import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const SubscriptionComponentComponent = Ember.Component.extend({

  subscription: null,
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  tSubscriptionCancelled: t("subscriptionCancelled"),

  isCancellingSubscription: false,

  isNotPerScan: Ember.computed.not('subscription.isPerScan'),

  confirmCallback() {
    const tSubscriptionCancelled = this.get("tSubscriptionCancelled");

    const subscriptionId = this.get("subscription.id");
    const url = [ENV.endpoints.subscriptions, subscriptionId].join('/');
    this.set("isCancellingSubscription", true);
    this.get("ajax").delete(url)
    .then(() => {
      if(!this.isDestroyed) {
        this.set("subscription.isCancelled", true);
        this.set("isCancellingSubscription", false);
      }
      this.get("notify").success(tSubscriptionCancelled);
      this.send("closeCancelSubscriptionConfirmBox");
    }, (error) => {
      if(!this.isDestroyed) {
        this.set("isCancellingSubscription", false);
        this.get("notify").error(error.payload.message);
      }
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
