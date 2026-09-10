import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SkThirdPartyAppsService from 'irene/services/sk-third-party-apps';
import type { SkThirdPartyAppStoreFilter } from 'irene/services/sk-third-party-apps';

export interface ThirdPartyScansQueryParams {
  tp_limit: number;
  tp_offset: number;
  tp_store: string;
  tp_region: string;
  tp_risk_status: number;
  tp_filter: string;
}

export default class AuthenticatedStoreknoxThirdPartyScansIndexRoute extends AkBreadcrumbsRoute {
  @service('sk-third-party-apps')
  declare skThirdPartyApps: SkThirdPartyAppsService;

  @service declare store: Store;

  queryParams = {
    tp_limit: { refreshModel: true },
    tp_offset: { refreshModel: true },
    tp_store: { refreshModel: true },
    tp_region: { refreshModel: true },
    tp_risk_status: { refreshModel: true },
    tp_filter: { refreshModel: true },
  };

  async model(params: ThirdPartyScansQueryParams) {
    const {
      tp_limit,
      tp_offset,
      tp_store,
      tp_region,
      tp_risk_status,
      tp_filter,
    } = params;

    const config = await this.store.queryRecord('sk-third-party-config', {});

    // Only a store with at least one opted region is actually usable - a
    // store the org hasn't opted into any region for (e.g. appstore with
    // regions_opted: []) must not be selectable at all.
    const regionsByStore: Record<SkThirdPartyAppStoreFilter, string[]> = {
      playstore: config?.playstoreRegionsOpted ?? [],
      appstore: config?.appstoreRegionsOpted ?? [],
    };
    const availableStores = (
      Object.keys(regionsByStore) as SkThirdPartyAppStoreFilter[]
    ).filter((storeOption) => regionsByStore[storeOption].length > 0);

    const requestedStore = tp_store as SkThirdPartyAppStoreFilter;
    const storeFilter = availableStores.includes(requestedStore)
      ? requestedStore
      : (availableStores[0] ?? 'playstore');

    const region = tp_region || regionsByStore[storeFilter][0] || '';

    this.skThirdPartyApps
      .setQueryParams({
        limit: tp_limit,
        offset: tp_offset,
        storeFilter,
        region,
        riskStatusFilter: tp_risk_status,
        filterQuery: tp_filter,
      })
      .reload();

    return { config };
  }
}
