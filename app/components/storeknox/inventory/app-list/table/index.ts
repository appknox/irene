import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import type MeService from 'irene/services/me';
import type { StoreknoxCommonTableColumnsData } from 'irene/components/storeknox/table-columns';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkInventoryAppService from 'irene/services/sk-inventory-apps';

type StoreknoxInventoryTableDataItem = StoreknoxCommonTableColumnsData & {
  appIsSelected: boolean;
  app: SkInventoryAppModel;
};

export interface StoreknoxInventoryAppListTableSignature {
  Element: HTMLElement;
  Args: {
    isAddingAppToInventory?: boolean;
    loadDisabledApps?: boolean;
    handleSelectedDisabledApps?: (apps: string[]) => void;
  };
}

export default class StoreknoxInventoryAppListTableComponent extends Component<StoreknoxInventoryAppListTableSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @service('sk-inventory-apps')
  declare skInventoryAppsService: SkInventoryAppService;

  @tracked selectedDisabledAppSet = new Set<string>();
  @tracked selectedDisabledAppIds: string[] = [];

  get loadDisabledApps() {
    return this.args.loadDisabledApps;
  }

  get disableRowClick() {
    return this.loadDisabledApps || this.isFetchingTableData;
  }

  get columns() {
    return [
      this.loadDisabledApps
        ? {
            cellComponent: 'storeknox/inventory/app-list/table/checkbox',
            minWidth: 20,
            width: 20,
            textAlign: 'center',
          }
        : null,
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
    return this.skInventoryAppsService.skInventoryAppsCount || 0;
  }

  get hasNoApps() {
    return !this.isFetchingTableData && this.totalAppsCount === 0;
  }

  get tableData() {
    if (this.isFetchingTableData) {
      return this.mockLoadingData;
    }

    return (this.skInventoryAppsService.skInventoryApps?.map((app) => {
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
        appIsSelected: this.selectedDisabledAppIds.some(
          (id) => id === (appMetadata.docUlid as string)
        ),
      };
    }) || []) as StoreknoxInventoryTableDataItem[];
  }

  get mockLoadingData() {
    return Array.from(new Array(7)).map(() => ({}));
  }

  get isFetchingTableData() {
    return this.skInventoryAppsService.isFetchingSkInventoryApps;
  }

  @action selectDisabledAppRow(ulid: string, value: boolean) {
    const selectedApsIds = [...this.selectedDisabledAppIds];

    if (value) {
      selectedApsIds.push(ulid);
      this.selectedDisabledAppIds = selectedApsIds;
    } else {
      this.selectedDisabledAppIds = selectedApsIds.filter((id) => id !== ulid);
    }

    this.args.handleSelectedDisabledApps?.(this.selectedDisabledAppIds);
  }

  @action getRowIsSelected(ulid: string, selectedItems: string[]) {
    return selectedItems.some((id) => id === ulid);
  }

  @action goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: args.limit,
        app_offset: 0,
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
