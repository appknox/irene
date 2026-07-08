import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';

interface AppDetailsParams {
  package_name: string;
  tp_store: string;
  tp_region: string;
  tp_version: string;
}

export default class AuthenticatedStoreknoxThirdPartyScansAppDetailsRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  queryParams = {
    tp_store: { refreshModel: true },
    tp_region: { refreshModel: true },
    tp_version: { refreshModel: true },
  };

  async resolveRegion(region: string) {
    if (region) {
      return region;
    }

    const config = await this.store.queryRecord('sk-third-party-config', {});

    return config?.regionsOpted?.[0] || 'US';
  }

  async model(params: AppDetailsParams): Promise<SkThirdPartyAppModel> {
    const query: Record<string, string> = {
      q: params.package_name,
      store: params.tp_store || 'appstore',
      region: await this.resolveRegion(params.tp_region),
    };

    if (params.tp_version) {
      query['version'] = params.tp_version;
    }

    return this.store.queryRecord('sk-third-party-app', query);
  }
}
