/* eslint-disable prettier/prettier */
import Route from '@ember/routing/route';

export default class RegisterViaInviteRoute extends Route {
  model(params) {
    return {
      'token': params.token
    };
  }
}
