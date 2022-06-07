import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedPostProductionScanRoute extends Route {
  @service organization;

  beforeModel() {
    if (!this.organization.selected.features.post_production_scan) {
      this.transitionTo('authenticated.projects');
    }
  }
}
