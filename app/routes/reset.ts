import Route from '@ember/routing/route';

export default class ResetRoute extends Route {
  model(params: { token: string }) {
    return params;
  }
}
