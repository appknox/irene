import ENV from 'irene/config/environment';
import BaseAuthenticator, { LoginSuccessDataProps, processData } from './base';
import parseError from 'irene/utils/parse-error';

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
          (error) => {
            const msg = 'Login failed: ' + parseError(error);

            this.notify.error(msg);
            this.router.transitionTo('login');

            return reject(msg);
          }
        );
    });
  }
}
