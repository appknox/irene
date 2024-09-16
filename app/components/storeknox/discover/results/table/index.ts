import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import MeService from 'irene/services/me';
import { StoreknoxDiscoveryResultQueryParam } from 'irene/routes/authenticated/storeknox/discover/result';
import SkDiscoveryResultService from 'irene/services/sk-discovery-result';
import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxDiscoverResultsTableSignature {
  Args: {
    queryParams: StoreknoxDiscoveryResultQueryParam;
  };
}

export default class StoreknoxDiscoverResultsTableComponent extends Component<StoreknoxDiscoverResultsTableSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare skDiscoveryResult: SkDiscoveryResultService;
  @service declare store: Store;

  constructor(
    owner: unknown,
    args: StoreknoxDiscoverResultsTableSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset, app_search_id, app_query } =
      args.queryParams;

    if (app_search_id) {
      this.skDiscoveryResult.fetchDiscoveryResults.perform(
        app_limit,
        app_offset,
        app_search_id,
        false
      );
    } else {
      this.skDiscoveryResult.uploadSearchQuery.perform(
        app_query,
        app_limit,
        app_offset
      );
    }
  }

  get searchResultsData() {
    if (this.skDiscoveryResult.isFetchingData) {
      return Array.from({ length: 5 }, () => ({}));
    } else {
      return this.skDiscoveryResult.skDiscoveryResultData?.slice() || [];
    }
  }

  get loadingData() {
    return this.skDiscoveryResult.isFetchingData;
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

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.skDiscoveryResult.fetchDiscoveryResults.perform(
      args.limit,
      args.offset,
      app_search_id
    );
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.skDiscoveryResult.fetchDiscoveryResults.perform(
      args.limit,
      0,
      app_search_id
    );
  }

  @action selectRow(data: SkDiscoverySearchResultModel, value: boolean) {
    this.skDiscoveryResult.selectRow(data.docUlid, value);
  }

  @action sendRequest() {
    this.skDiscoveryResult.addMultipleToInventory.perform();
  }

  @action selectAllRow(value: boolean) {
    this.skDiscoveryResult.selectAllRow(value);
  }

  get disabledButton() {
    return this.skDiscoveryResult.selectedResults.length === 0;
  }

  get totalCount() {
    return this.skDiscoveryResult.skDiscoveryResultData?.meta?.count || 0;
  }

  get hasNoApps() {
    const appCount = this.skDiscoveryResult.skDiscoveryResultData?.meta?.count;

    if (appCount) {
      return appCount <= 0;
    }

    return true;
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get isAdmin() {
    return this.me.org?.is_admin;
  }

  get buttonIconName() {
    return this.isAdmin ? 'add-box' : 'send';
  }

  get buttonText() {
    return this.isAdmin
      ? this.intl.t('storeknox.addToInventory')
      : this.intl.t('storeknox.sendRequest');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table': typeof StoreknoxDiscoverResultsTableComponent;
  }
}
