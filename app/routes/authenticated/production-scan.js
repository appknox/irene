import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedProductionScanRoute extends Route {
  @service organization;
  @service store;

  beforeModel() {
    // if (!this.organization.selected.features.post_production_scan) {
    //   this.transitionTo('authenticated.projects');
    // }
  }

  async model() {
    const amConfig = await this.organization.get_am_configurtion();

    return {
      settings: this.store.findRecord('amconfiguration', amConfig.id),
    };
  }
}
