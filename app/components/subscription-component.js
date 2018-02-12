/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
    return this.get("ajax").delete(url)
    .then(data => that.set("subscription.isCancelled", true)).then(function(data) {
      that.get("notify").success(tSubscriptionCancelled);
      return that.send("closeCancelSubscriptionConfirmBox");}).catch(error =>
      (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })()
    );
  },

  actions: {

    openCancelSubscriptionConfirmBox() {
      return this.set("showCancelSubscriptionConfirmBox", true);
    },

    closeCancelSubscriptionConfirmBox() {
      return this.set("showCancelSubscriptionConfirmBox", false);
    }
  }
});

export default SubscriptionComponentComponent;
