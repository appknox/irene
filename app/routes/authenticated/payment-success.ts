import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import config from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';

export default class AuthenticatedPaymentSuccessRoute extends Route {
  @service declare ajax: IreneAjaxService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  beforeModel() {
    const queryParams = this.window.location.href.split('?')[1];

    this.ajax
      .post(`${config.endpoints['chargebeeCallback']}?${queryParams}`)
      .then(
        () => {
          this.notify.success('Payment Successful');
        },
        () => {
          this.notify.error('Payment failed to update!');
        }
      );
  }
}
