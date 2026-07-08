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
    const region = tp_region || config?.regionsOpted?.[0] || 'US';

    this.skThirdPartyApps
      .setQueryParams({
        limit: tp_limit,
        offset: tp_offset,
        storeFilter: (tp_store as SkThirdPartyAppStoreFilter) || 'appstore',
        region,
        riskStatusFilter: tp_risk_status,
        filterQuery: tp_filter,
      })
      .reload();

    return { config };
  }
}
