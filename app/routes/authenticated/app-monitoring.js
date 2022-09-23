import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedAppMonitoringRoute extends Route {
  @service organization;

  beforeModel() {
    if (!this.organization.selected.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model() {
    const orgModel = this.organization.selected;
    return {
      settings: await orgModel.get_am_configuration(),
    };
  }
}
