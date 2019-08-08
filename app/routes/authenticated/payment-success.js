import Route from '@ember/routing/route';
import config from 'irene/config/environment';

import { inject as service } from '@ember/service';
import { translationMacro as t } from 'ember-i18n';


const AuthenticatedPaymentSuccessRoute = Route.extend({
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  tPaymentSuccessful: t('paymentSuccessful'),
  tPaymentUpdateFailed: t('paymentUpdateFailed'),

  beforeModel(){
    const queryParams = location.href.split('?')[1];
    this.get("ajax").post(`${config.endpoints.chargebeeCallback}?${queryParams}`)
    .then(() => {
       this.get("notify").success(this.get('tPaymentSuccessful'));
     }, () => {
      this.get("notify").error(this.get('tPaymentUpdateFailed'));
    });
  }
});

export default AuthenticatedPaymentSuccessRoute;
