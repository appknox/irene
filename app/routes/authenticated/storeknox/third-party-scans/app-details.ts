import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';
import type { SkThirdPartyAppStoreFilter } from 'irene/services/sk-third-party-apps';

interface AppDetailsParams {
  package_name: string;
  tp_store: SkThirdPartyAppStoreFilter;
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

  async resolveRegion(region: string, store: string) {
    if (region) {
      return region;
    }

    const config = await this.store.queryRecord('sk-third-party-config', {});

    const regionsOpted =
      store === 'playstore'
        ? config?.playstoreRegionsOpted
        : config?.appstoreRegionsOpted;

    return regionsOpted?.[0] || '';
  }

  async model(params: AppDetailsParams): Promise<SkThirdPartyAppModel> {
    const store = params.tp_store || 'playstore';

    const query: Record<string, string> = {
      q: params.package_name,
      store,
      region: await this.resolveRegion(params.tp_region, store),
    };

    if (params.tp_version) {
      query['version'] = params.tp_version;
    }

    return this.store.queryRecord('sk-third-party-app', query);
  }
}
