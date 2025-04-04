import ENV from 'irene/config/environment';
import BaseAuthenticator, { LoginSuccessDataProps, processData } from './base';
import type { AjaxError } from 'irene/services/ajax';

export default class Saml2Auth extends BaseAuthenticator {
  authenticate(ssotoken: string) {
    return new Promise((resolve, reject) => {
      const url = ENV['endpoints']['saml2Login'] as string;

      this.ajax
        .post<LoginSuccessDataProps>(url, { data: { token: ssotoken } })
        .then(
          (data) => {
            this.restoreLastTransition(data.user_id);

            data = processData(data);
            resolve(data);
          },
          (error: AjaxError) => {
            let msg = 'Login failed';

            if (error.payload.message) {
              msg = 'Login failed: ' + error.payload.message;
            }

            this.notify.error(msg);
            this.router.transitionTo('login');

            return reject(msg);
          }
        );
    });
  }
}
