import Ember from 'ember';
import config from 'irene/config/environment';

const AuthenticatedPaymentSuccessRoute = Ember.Route.extend({
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  beforeModel(){
    const queryParams = location.href.split('?')[1];
    this.get("ajax").post(`${config.endpoints.chargebeeCallback}?${queryParams}`)
    .then(() => {
       this.get("notify").success("Payment Successful");
     }, () => {
      this.get("notify").error("PAYMENT FAILED TO UPDATE!!!");
    });
  }
});

export default AuthenticatedPaymentSuccessRoute;
