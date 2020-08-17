import Route from '@ember/routing/route';
import config from 'irene/config/environment';

import { inject as service } from '@ember/service';

export default class AuthenticatedPaymentSuccessRoute extends Route {
  @service ajax;
  @service('notifications') notify;

  beforeModel(){
    const queryParams = location.href.split('?')[1];
    this.ajax.post(`${config.endpoints.chargebeeCallback}?${queryParams}`)
    .then(() => {
       this.notify.success("Payment Successful");
     }, () => {
      this.notify.error("Payment failed to update!");
    });
  }
}
