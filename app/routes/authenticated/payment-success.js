import Ember from 'ember';
import config from 'irene/config/environment';

const AuthenticatedPaymentSuccessRoute = Ember.Route.extend({
  ajax: Ember.inject.service(),
  notify: Ember.inject.service(),

  beforeModel(){
    const queryParams = location.href.split('?')[1];
    const that = this;
    this.get("ajax").post(`${config.endpoints.chargebeeCallback}?${queryParams}`)
    .then(data=> that.get("notify").success("Payment Successful"))
    .catch(function(error) {
      that.get("notify").error("PAYMENT FAILED TO UPDATE!!!");
    });
  }
});

export default AuthenticatedPaymentSuccessRoute;
