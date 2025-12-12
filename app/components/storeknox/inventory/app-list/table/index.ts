import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import type MeService from 'irene/services/me';
import type { StoreknoxCommonTableColumnsData } from 'irene/components/storeknox/table-columns';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkAppsService from 'irene/services/sk-apps';

type StoreknoxInventoryTableDataItem = StoreknoxCommonTableColumnsData & {
  app: SkInventoryAppModel;
};

export default class StoreknoxInventoryAppListTableComponent extends Component {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('sk-apps') declare skAppsService: SkAppsService;

  get isFetchingTableData() {
    return this.skAppsService.isFetchingSkInventoryApps;
  }

  get monitoringStatusFilter() {
    return this.skAppsService.monitoringStatusFilter;
  }

  get filterApplied() {
    return this.monitoringStatusFilter > -1;
  }

  get disableRowClick() {
    return this.isFetchingTableData;
  }

  get showEmptyState() {
    return this.hasNoApps && this.filterApplied;
  }

  get hidePagination() {
    return this.showEmptyState || this.isFetchingTableData;
  }

  get columns() {
    return [
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 80,
        width: 80,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
        width: 300,
      },
      {
        name: this.intl.t('developer'),
        cellComponent: 'storeknox/table-columns/developer',
        width: 250,
      },
      {
        name: 'Monitoring Status',
        cellComponent: 'storeknox/inventory/app-list/table/monitoring-status',
        width: 150,
        textAlign: 'left',
        headerComponent:
          'storeknox/inventory/app-list/table/monitoring-status-header',
      },
      // {
      //   headerComponent:
      //     'storeknox/inventory/app-list/table/availability-header',
      //   cellComponent: 'storeknox/inventory/app-list/table/availability',
      //   textAlign: 'center',
      // },
    ].filter(Boolean);
  }

  get totalAppsCount() {
    return this.skAppsService.skAppsCount;
  }

  get hasNoApps() {
    return !this.isFetchingTableData && this.totalAppsCount === 0;
  }

  get tableData() {
    if (this.isFetchingTableData) {
      return this.mockLoadingData;
    }

    return (this.skAppsService.skApps?.map((app) => {
      const { appMetadata } = app;

      return {
        title: appMetadata.title,
        appUrl: appMetadata.url,
        isAndroid: appMetadata?.platform === ENUMS.PLATFORM.ANDROID,
        isIos: appMetadata?.platform === ENUMS.PLATFORM.IOS,
        iconUrl: appMetadata?.iconUrl,
        name: appMetadata.title,
        packageName: appMetadata.packageName,
        companyName: appMetadata.devEmail,
        devName: appMetadata.devName,
        devEmail: appMetadata.devEmail,
        app,
      };
    }) || []) as StoreknoxInventoryTableDataItem[];
  }

  get mockLoadingData() {
    return Array.from(new Array(7)).map(() => ({}));
  }

  @action onStatusChange(status: number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: this.skAppsService.limit,
        app_offset: 0,
        monitoring_status: status,
      },
    });
  }

  @action goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
        monitoring_status: this.monitoringStatusFilter,
      },
    });
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: args.limit,
        app_offset: 0,
        monitoring_status: this.monitoringStatusFilter,
      },
    });
  }

  @action handleRowClick(app: StoreknoxInventoryTableDataItem) {
    if (!this.disableRowClick) {
      this.router.transitionTo(
        'authenticated.storeknox.inventory-details.index',
        app.app.id
      );
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::AppList::Table': typeof StoreknoxInventoryAppListTableComponent;
  }
}
