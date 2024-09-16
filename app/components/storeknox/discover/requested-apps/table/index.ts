import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

import { StoreknoxDiscoveryRequestedQueryParam } from 'irene/routes/authenticated/storeknox/discover/requested';
import SkRequestedAppService from 'irene/services/sk-requested-app';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxDiscoverRequestedAppsTableSignature {
  Args: {
    queryParams: StoreknoxDiscoveryRequestedQueryParam;
  };
}

export default class StoreknoxDiscoverRequestedAppsTableComponent extends Component<StoreknoxDiscoverRequestedAppsTableSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare skRequestedApp: SkRequestedAppService;

  constructor(
    owner: unknown,
    args: StoreknoxDiscoverRequestedAppsTableSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset } = args.queryParams;

    this.skRequestedApp.fetchRequestedApps.perform(app_limit, app_offset);
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    this.skRequestedApp.fetchRequestedApps.perform(args.limit, args.offset);
  }

  @action onItemPerPageChange(args: LimitOffset) {
    this.skRequestedApp.fetchRequestedApps.perform(args.limit, 0);
  }

  get totalCount() {
    return this.skRequestedApp.totalCount;
  }

  get hasNoApps() {
    return this.skRequestedApp.totalCount <= 0 && !this.loadingData;
  }

  get requestedAppsData() {
    if (this.skRequestedApp.isFetchingData) {
      return Array.from({ length: 5 }, () => ({}));
    } else {
      return this.skRequestedApp.skRequestedAppData?.slice() || [];
    }
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

  get loadingData() {
    return this.skRequestedApp.isFetchingData;
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
        cellComponent: 'storeknox/discover/requested-apps/table/status',
        width: 80,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps::Table': typeof StoreknoxDiscoverRequestedAppsTableComponent;
  }
}
