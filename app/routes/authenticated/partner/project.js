import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedPartnerProjectRoute extends Route {
  @service organization;
  @service partner;
  @service('notifications') notify;
  @service store;

  async beforeModel() {
    await this.partner.load();
    if (!this.get('organization.selected.features.partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }

    if (!this.get('partner.access.list_files')) {
      this.transitionTo('authenticated.partner.clients');
    }
  }

  async model(data) {
    return {
      client: await this.store.find('partner/partnerclient', data.client_id),
      project: await this.store.find(
        'partner/partnerclient-project',
        data.project_id
      ),
    };
  }

  @action
  error() {
    this.notify.error('Problem with viewing files!');
    this.transitionTo('authenticated.partner.clients');
  }
}
