/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
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
    return {
      client: await this.store.find('partner/partnerclient', data.id),
      partner: await this.partner,
    };
  }

  @action
  error() {
    this.transitionTo('authenticated.partner.clients');
  }
}
