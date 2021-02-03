import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedClientRoute extends Route {

  @service store;
  @service me;
  beforeModel() {
    // Redirect to projects
    if (!this.get('me.partner.show_partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }
  }
  model(data) {
    return this.store.find('client', data.client_id);
  }
}
