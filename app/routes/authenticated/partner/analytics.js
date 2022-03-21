/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedPartnerAnalyticsRoute extends Route {
  @service partner;
  @service organization;

  beforeModel() {
    if (!this.get('organization.selected.features.partner_dashboard')) {
      this.transitionTo('authenticated.projects');
    }

    if (!this.get('partner.access.view_analytics')) {
      this.transitionTo('authenticated.partner.clients');
    }
  }
}
