import Route from '@ember/routing/route';

export default class RegisterViaInviteRoute extends Route {
  model(params: { token: string }) {
    return {
      token: params.token,
    };
  }
}
