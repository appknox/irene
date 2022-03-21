/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

const SubscriptionComponentComponent = Component.extend({

  subscription: null,
  intl: service(),
  ajax: service(),
  notify: service('notifications'),
  tSubscriptionCancelled: t("subscriptionCancelled"),

  isCancellingSubscription: false,

  isNotPerScan: computed.not('subscription.isPerScan'),

  confirmCallback() {
    const tSubscriptionCancelled = this.get("tSubscriptionCancelled");

    const subscriptionId = this.get("subscription.id");
    const url = [ENV.endpoints.subscriptions, subscriptionId].join('/');
    this.set("isCancellingSubscription", true);
    this.get("ajax").delete(url)
    .then(() => {
      this.get("notify").success(tSubscriptionCancelled);
      if(!this.isDestroyed) {
        this.set("subscription.isCancelled", true);
        this.set("isCancellingSubscription", false);
        this.send("closeCancelSubscriptionConfirmBox");
      }
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
