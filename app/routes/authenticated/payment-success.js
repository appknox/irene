import Route from '@ember/routing/route';
import config from 'irene/config/environment';

import { inject as service } from '@ember/service';

const AuthenticatedPaymentSuccessRoute = Route.extend({
  ajax: service(),
  notify: service('notification-messages-service'),

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
