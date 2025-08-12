import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import SkArchivedAppsService from 'irene/services/sk-archived-apps';
import type MeService from 'irene/services/me';
import type { StoreknoxCommonTableColumnsData } from 'irene/components/storeknox/table-columns';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SkAppModel from 'irene/models/sk-app';

type StoreknoxInventoryTableDataItem = StoreknoxCommonTableColumnsData & {
  app: SkAppModel;
};

export interface StoreknoxInventoryArchivedAppsTableSignature {
  Element: HTMLElement;
}

export default class StoreknoxInventoryArchivedAppsTableComponent extends Component<StoreknoxInventoryArchivedAppsTableSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @service('sk-archived-apps')
  declare skArchivedAppsService: SkArchivedAppsService;

  get disableRowClick() {
    return this.isFetchingTableData;
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
        name: this.intl.t('storeknox.archivedBy'),
        cellComponent: 'storeknox/inventory/archived-apps/table/archived-by',
        width: 200,
      },
      {
        name: this.intl.t('storeknox.dateOfArchive'),
        cellComponent: 'storeknox/inventory/archived-apps/table/archived-date',
        width: 200,
      },
      {
        name: this.intl.t('action'),
        cellComponent: 'storeknox/inventory/archived-apps/table/action',
      },
    ];
  }

  get totalAppsCount() {
    return this.skArchivedAppsService.skArchivedAppsCount;
  }

  get hasNoApps() {
    return !this.isFetchingTableData && this.totalAppsCount === 0;
  }

  get mockLoadingData() {
    return Array.from(new Array(7)).map(() => ({}));
  }

  get tableData() {
    if (this.isFetchingTableData) {
      return this.mockLoadingData;
    }

    return (this.skArchivedAppsService.skArchivedApps?.map((app) => {
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

  get isFetchingTableData() {
    return this.skArchivedAppsService.isFetchingSkArchivedApps;
  }

  @action goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  @action async reloadArchivedAppsTable() {
    await this.skArchivedAppsService
      .setLimitOffset({
        offset: 0,
        limit: this.skArchivedAppsService.limit,
      })
      .reload();
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
    'Storeknox::Inventory::ArchivedApps::Table': typeof StoreknoxInventoryArchivedAppsTableComponent;
  }
}
