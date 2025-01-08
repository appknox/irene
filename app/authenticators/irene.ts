import ENV from 'irene/config/environment';
import BaseAuthenticator, { LoginSuccessDataProps, processData } from './base';

class IreneAuthenticator extends BaseAuthenticator {
  async authenticate(identification: string, password: string, otp: string) {
    const data = {
      username: identification.toLowerCase(), // Ensure username is in lowercase since the server does case-insensitive comparison
      password,
      otp,
    };

    const url = ENV['ember-simple-auth']['loginEndPoint'];

    return this.ajax.post<LoginSuccessDataProps>(url, { data }).then((data) => {
      this.restoreLastTransition(data.user_id);

      return processData(data);
    });
  }
}

export default IreneAuthenticator;
