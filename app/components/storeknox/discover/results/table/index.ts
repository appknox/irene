import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type MeService from 'irene/services/me';
import type SkDiscoverySearchResultService from 'irene/services/sk-discovery-search-result';

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxDiscoverResultsTableComponent extends Component {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare router: RouterService;
  @service declare skDiscoverySearchResult: SkDiscoverySearchResultService;

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get isLoadingDiscoveryResults() {
    return this.skDiscoverySearchResult.isFetchingSkDiscoverySearchResults;
  }

  get searchResultsData() {
    if (this.isLoadingDiscoveryResults) {
      return Array.from({ length: 5 }, () => ({}));
    } else {
      return (
        this.skDiscoverySearchResult.skDiscoverySearchResults?.slice() || []
      );
    }
  }

  get columns() {
    return [
      // {
      //   headerComponent: 'storeknox/table-columns/checkbox-header',
      //   cellComponent: 'storeknox/table-columns/checkbox',
      //   minWidth: 10,
      //   width: 10,
      //   textAlign: 'center',
      // },
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 50,
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
        width: 200,
      },
      {
        name: this.intl.t('developer'),
        cellComponent: 'storeknox/table-columns/developer',
        width: 200,
      },
      {
        headerComponent: 'storeknox/discover/results/table/action-header',
        cellComponent: 'storeknox/discover/results/table/action',
        minWidth: 50,
        width: 50,
        textAlign: 'center',
      },
    ];
  }

  get queryParams() {
    return {
      app_limit: this.skDiscoverySearchResult.limit,
      app_offset: this.skDiscoverySearchResult.offset,
      app_search_id: this.skDiscoverySearchResult.searchId,
      app_query: this.skDiscoverySearchResult.searchQuery,
    };
  }

  get disabledButton() {
    return true;
  }

  get totalCount() {
    return this.skDiscoverySearchResult.skDiscoverySearchResultsCount || 0;
  }

  get hasNoApps() {
    if (this.isLoadingDiscoveryResults) {
      return false;
    }

    return this.totalCount === 0;
  }

  get isOwner() {
    return this.me.org?.is_owner;
  }

  get buttonIconName() {
    return this.isOwner ? 'add-box' : 'send';
  }

  get buttonText() {
    return this.isOwner
      ? this.intl.t('storeknox.addToInventory')
      : this.intl.t('storeknox.sendRequest');
  }

  @action goToPage(args: LimitOffset) {
    this.setRouteQueryParams(args.limit, args.offset);
  }

  @action onItemPerPageChange(args: LimitOffset) {
    this.setRouteQueryParams(args.limit, 0);
  }

  setRouteQueryParams(limit: number, offset: number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table': typeof StoreknoxDiscoverResultsTableComponent;
  }
}
