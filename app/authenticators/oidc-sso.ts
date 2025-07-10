import ENV from 'irene/config/environment';
import BaseAuthenticator, { LoginSuccessDataProps, processData } from './base';
import type { AjaxError } from 'irene/services/ajax';

export default class OidcSsoAuth extends BaseAuthenticator {
  authenticate(oidctoken: string) {
    return new Promise((resolve, reject) => {
      const url = ENV['endpoints']['oidcSsoLogin'] as string;

      this.ajax
        .post<LoginSuccessDataProps>(url, { data: { token: oidctoken } })
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
