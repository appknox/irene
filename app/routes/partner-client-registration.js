import Route from '@ember/routing/route';

export default class PartnerClientRegistrationRoute extends Route {

  model(params) {
    return {
      token: params.token,
    }
  }
}
