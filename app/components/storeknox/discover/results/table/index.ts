import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { DS } from 'ember-data';

import MeService from 'irene/services/me';
import { StoreknoxDiscoveryResultQueryParam } from 'irene/routes/authenticated/storeknox/discover/result';
import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';
import { waitForPromise } from '@ember/test-waiters';

type SkDiscoveryQueryResponse =
  DS.AdapterPopulatedRecordArray<SkDiscoverySearchResultModel> & {
    meta: { count: number };
  };

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
  // @service declare skDiscoveryResult: SkDiscoveryResultService;
  @service declare store: Store;

  @tracked skDiscoveryQueryResponse: SkDiscoveryQueryResponse | null = null;

  constructor(
    owner: unknown,
    args: StoreknoxDiscoverResultsTableSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset, app_search_id, app_query } =
      args.queryParams;

    if (app_search_id) {
      this.fetchDiscoveryResults.perform(
        app_limit,
        app_offset,
        app_search_id,
        false
      );
    } else {
      this.uploadSearchQuery.perform(app_query, app_limit, app_offset);
    }
  }

  @tracked searchResults = [
    {
      isAndroid: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Asia',
      packageName: 'com.shellasia.android',
      companyName: 'Shell Information Technology International',
      mailId: 'asiashell@shell.com',
      requested: true,
      exists: false,
    },
    {
      isAndroid: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Recharge India',
      packageName: 'com.shellrecharge.india',
      companyName: 'Shell Information Technology International',
      mailId: null,
      requested: false,
    },
    {
      isIos: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Mobility Site Manager',
      packageName: 'com.shellmobility.ios',
      companyName: 'Shell Information Technology International',
      mailId: null,
      requested: true,
      exists: true,
    },
  ];

  get tableData() {
    return this.searchResultsData;
  }

  get searchResultsData() {
    return this.skDiscoveryQueryResponse?.toArray() || [];
  }

  get columns() {
    return [
      {
        headerComponent: 'storeknox/table-columns/checkbox-header',
        cellComponent: 'storeknox/table-columns/checkbox',
        minWidth: 10,
        width: 10,
        textAlign: 'center',
      },
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

    this.fetchDiscoveryResults.perform(args.limit, args.offset, app_search_id);
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.fetchDiscoveryResults.perform(args.limit, 0, app_search_id);
  }

  get totalCount() {
    return this.skDiscoveryQueryResponse?.meta?.count || 0;
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

  setRouteQueryParams(
    limit: string | number,
    offset: string | number,
    searchId: string | number
  ) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
        app_search_id: searchId,
      },
    });
  }

  uploadSearchQuery = task(
    async (
      searchQuery: string,
      limit: string | number,
      offset: string | number
    ) => {
      try {
        const discoveryQuery = this.store.createRecord('skDiscovery', {
          query_str: searchQuery,
        });

        const uploadedDiscovery = await waitForPromise(discoveryQuery.save());

        this.router.transitionTo('authenticated.storeknox.discover.result', {
          queryParams: { app_search_id: uploadedDiscovery.id },
        });

        this.fetchDiscoveryResults.perform(
          limit,
          offset,
          uploadedDiscovery.id,
          false
        );
      } catch (error) {
        console.log(error);
      }
    }
  );

  fetchDiscoveryResults = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      searchId: string | number,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, searchId);
      }

      try {
        this.skDiscoveryQueryResponse = (await this.store.query(
          'skDiscoveryResult',
          {
            limit,
            offset,
            id: searchId,
          }
        )) as SkDiscoveryQueryResponse;
      } catch (e) {
        console.log(e);
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table': typeof StoreknoxDiscoverResultsTableComponent;
  }
}
