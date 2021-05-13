import Route from '@ember/routing/route';
import {
  inject as service
} from '@ember/service';
import {
  action
} from '@ember/object';

export default class AuthenticatedClientRoute extends Route {

  @service organization;
  @service('notifications') notify;

  beforeModel() {
    // Redirect to projects
    if (!this.get('organization.selected.features.partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }
  }

  model(data) {
    return this.store.find('client', data.id)
  }

  @action
  error() {
    this.notify.error('Client not found')
    this.transitionTo('authenticated.partner.clients')
  }
}
