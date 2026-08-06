import { Promise } from 'rsvp';
import type { LoginSuccessDataProps } from './base';
import BaseAuthenticator, { processData } from './base';

export default class LoginAuth extends BaseAuthenticator {
  authenticate(data: LoginSuccessDataProps) {
    return new Promise((resolve) => {
      data = processData(data);
      resolve(data);
    });
  }
}
