import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';
import type { StoreknoxDiscoveryResultQueryParam } from 'irene/routes/authenticated/storeknox/discover/result';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxDiscoverResultsTableSignature {
  Args: {
    queryParams: StoreknoxDiscoveryResultQueryParam;
    isLoading: boolean;
    skDiscoveryResultData: any;
    fetchDiscoveryResults: (
      limit: number,
      offset: number,
      searchId: string | number,
      setQueryParams: boolean,
      app_query?: string
    ) => void;
  };
}

export default class StoreknoxDiscoverResultsTableComponent extends Component<StoreknoxDiscoverResultsTableSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;

  constructor(
    owner: unknown,
    args: StoreknoxDiscoverResultsTableSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset, app_search_id, app_query } =
      args.queryParams;

    this.args.fetchDiscoveryResults(
      app_limit,
      app_offset,
      app_search_id,
      false,
      app_query
    );
  }

  get searchResultsData() {
    if (this.args.isLoading) {
      // return Array.from({ length: 5 }, () => ({}));
      return [];
    } else {
      return this.args.skDiscoveryResultData?.slice() || [];
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

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.args.fetchDiscoveryResults(
      args.limit,
      args.offset,
      app_search_id,
      true
    );
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.args.fetchDiscoveryResults(args.limit, 0, app_search_id, true);
  }

  get disabledButton() {
    return true;
  }

  get totalCount() {
    return this.args.skDiscoveryResultData?.meta?.count || 0;
  }

  get hasNoApps() {
    const appCount = this.args.skDiscoveryResultData?.meta?.count;

    if (this.args.isLoading) {
      return false;
    }

    return !appCount;
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get limit() {
    return this.args.queryParams.app_limit;
  }

  get offset() {
    return this.args.queryParams.app_offset;
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
