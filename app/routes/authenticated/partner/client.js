import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedClientRoute extends Route {
  @service organization;
  @service partner;
  @service('notifications') notify;

  beforeModel() {
    if (!this.get('organization.selected.features.partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model(data) {
    await this.partner.load();
    return this.store.find('partner/partnerclient', data.id);
  }

  @action
  error() {
    // this.notify.error('Client not found');
    this.transitionTo('authenticated.partner.clients');
  }
}
