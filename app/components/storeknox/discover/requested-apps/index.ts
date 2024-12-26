import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type Store from '@ember-data/store';

import type { StoreknoxDiscoveryRequestedQueryParam } from 'irene/routes/authenticated/storeknox/discover/requested';
import type SkRequestedAppModel from 'irene/models/sk-requested-app';
import parseError from 'irene/utils/parse-error';

interface LimitOffset {
  limit: number;
  offset: number;
}

type SkRequestedAppResponse =
  DS.AdapterPopulatedRecordArray<SkRequestedAppModel> & {
    meta: { count: number };
  };

export const DEFAULT_PROJECT_QUERY_PARAMS = {
  query: '',
  platform: -1,
};

export interface StoreknoxDiscoverRequestedAppsSignature {
  Args: {
    queryParams: StoreknoxDiscoveryRequestedQueryParam;
  };
}

export default class StoreknoxDiscoverRequestedAppsComponent extends Component<StoreknoxDiscoverRequestedAppsSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked skRequestedAppData: SkRequestedAppResponse | null = null;

  constructor(
    owner: unknown,
    args: StoreknoxDiscoverRequestedAppsSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset } = args.queryParams;

    this.fetchRequestedApps.perform(app_limit, app_offset);
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    this.fetchRequestedApps.perform(args.limit, args.offset);
  }

  @action onItemPerPageChange(args: LimitOffset) {
    this.fetchRequestedApps.perform(args.limit, 0);
  }

  get isFetchingData() {
    return this.fetchRequestedApps.isRunning;
  }

  fetchRequestedApps = task(
    { drop: true },
    async (limit: number, offset: number, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        this.skRequestedAppData = (await this.store.query('sk-requested-app', {
          limit,
          offset,
        })) as SkRequestedAppResponse;
      } catch (e) {
        this.notify.error(parseError(e));
      }
    }
  );

  setRouteQueryParams(limit: number, offset: number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  get totalCount() {
    return this.skRequestedAppData?.meta?.count || 0;
  }

  get hasNoApps() {
    return !this.isFetchingData && this.totalCount <= 0;
  }

  get requestedAppsData() {
    if (this.isFetchingData) {
      return Array.from({ length: 5 }, () => ({}));
    } else {
      return this.skRequestedAppData?.slice() || [];
    }
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

  get columns() {
    return [
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 30,
        width: 30,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
      },
      {
        name: this.intl.t('developer'),
        cellComponent: 'storeknox/table-columns/developer',
      },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/discover/requested-apps/status',
        width: 80,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps': typeof StoreknoxDiscoverRequestedAppsComponent;
  }
}
