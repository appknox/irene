/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import config from 'irene/config/environment';

const AuthenticatedPaymentSuccessRoute = Ember.Route.extend({
  ajax: Ember.inject.service(),
  notify: Ember.inject.service(),

  beforeModel(){
    const queryParams = location.href.split('?')[1];
    const that = this;
    this.get("ajax").post(`${config.endpoints.chargebeeCallback}?${queryParams}`)
    .then(data=> that.get("notify").success("Payment Successful")).catch(function(error) {
      that.get("notify").error("PAYMENT FAILED TO UPDATE!!!");
      return (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })();
    });
  }
});

export default AuthenticatedPaymentSuccessRoute;
