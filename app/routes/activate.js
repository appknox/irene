import ENV from 'irene/config/environment';
import Route from '@ember/routing/route';

export default class ActivateRoute extends Route {
  model(params) {
    const url = [ENV.endpoints.activate, params.pk, params.token].join('/');
    return this.get('ajax').request(url);
  }

  redirect() {
    this.get("notify").info("Your account has been activated. Please login to continue");
    this.transitionTo('login');
  }
}
