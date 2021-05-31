import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';

export default class AuthenticatedPartnerRoute extends Route {

  @service me;
  @service partner;


  beforeModel() {
    // Redirect to partner/clients
    // this.transitionTo('authenticated.partner.clients');
  }

  async model() {
    // Load partner service
    await this.partner.load();
  }
}
