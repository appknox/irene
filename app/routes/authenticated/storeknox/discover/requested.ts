import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type MeService from 'irene/services/me';

export interface StoreknoxDiscoveryRequestedQueryParam {
  app_limit: number;
  app_offset: number;
}

export default class AuthenticatedStoreknoxDiscoverRequestedRoute extends Route {
  @service declare me: MeService;
  @service declare router: RouterService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    if (this.me.org?.is_owner) {
      this.router.transitionTo('authenticated.storeknox.discover.result');
    }
  }

  model(params: Partial<StoreknoxDiscoveryRequestedQueryParam>) {
    const { app_limit, app_offset } = params;

    return {
      queryParams: { app_limit, app_offset },
    };
  }
}
