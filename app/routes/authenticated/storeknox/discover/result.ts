import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type SkDiscoverySearchResultService from 'irene/services/sk-discovery-search-result';

export interface StoreknoxDiscoveryResultQueryParam {
  app_limit: number;
  app_offset: number;
  app_search_id: string;
  app_query: string;
}

export default class AuthenticatedStoreknoxDiscoverResultRoute extends Route {
  @service declare skDiscoverySearchResult: SkDiscoverySearchResultService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
    app_search_id: {
      refreshModel: true,
    },
    app_query: {
      refreshModel: true,
    },
  };

  model(params: Partial<StoreknoxDiscoveryResultQueryParam>) {
    const { app_limit, app_offset, app_search_id, app_query } = params;

    this.skDiscoverySearchResult
      .setLimitOffset({
        limit: app_limit,
        offset: app_offset,
      })
      .setQueryData({
        searchId: app_search_id,
        searchQuery: app_query,
      });

    // if no search id and query, fetch search id first then reload route
    if (!app_search_id && app_query) {
      this.skDiscoverySearchResult.fetchSearchIdForQuery(app_query);
    }

    if (app_query && app_search_id) {
      this.skDiscoverySearchResult.fetchDiscoveryResults();
    }
  }
}
