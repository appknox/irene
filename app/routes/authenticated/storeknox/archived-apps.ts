import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { service } from '@ember/service';

import type SkArchivedAppsService from 'irene/services/sk-archived-apps';
import type MeService from 'irene/services/me';

export interface StoreknoxInventoryArchivedAppsQueryParams {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxInventoryArchivedAppsRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;

  @service('sk-archived-apps')
  declare skArchivedAppsService: SkArchivedAppsService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  beforeModel() {
    if (!this.me.org?.get('is_owner') && !this.me.org?.get('is_admin')) {
      this.router.transitionTo('authenticated.storeknox.inventory');
    }
  }

  async model(params: Partial<StoreknoxInventoryArchivedAppsQueryParams>) {
    const { app_limit, app_offset } = params;

    this.skArchivedAppsService
      .setLimitOffset({
        limit: app_limit,
        offset: app_offset,
      })
      .reload();
  }
}
