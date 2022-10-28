import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedAppMonitoringRoute extends Route {
  @service organization;
  @service appmonitoring;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  beforeModel() {
    if (!this.organization.selected.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model({ app_limit, app_offset }) {
    await this.appmonitoring
      .setLimitOffset({
        limit: app_limit,
        offset: app_offset,
      })
      .reload();

    const orgModel = this.organization.selected;
    return {
      settings: await orgModel.get_am_configuration(),
    };
  }
}
