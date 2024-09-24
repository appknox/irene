// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type RouterService from '@ember/routing/router-service';
import type { Owner } from '@ember/test-helpers/build-owner';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type IntlService from 'ember-intl/services/intl';
import type MeService from 'irene/services/me';
import type Store from '@ember-data/store';
import type SkAppModel from 'irene/models/sk-app';
import type { StoreknoxCommonTableColumnsData } from 'irene/components/storeknox/table-columns';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

type SkAppsQueryResponse = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

type StoreknoxInventoryTableDataItem = StoreknoxCommonTableColumnsData & {
  appIsSelected: boolean;
  app: SkAppModel;
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

  @tracked skAppsResponse: SkAppsQueryResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked selectedDisabledAppSet = new Set<string>();
  @tracked selectedDisabledAppIds: string[] = [];

  constructor(
    owner: Owner,
    args: StoreknoxInventoryAppListTableSignature['Args']
  ) {
    super(owner, args);

    this.fetchSkApps.perform();
  }

  get loadDisabledApps() {
    return this.args.loadDisabledApps;
  }

  get disableRowClick() {
    return this.loadDisabledApps || this.fetchSkApps.isRunning;
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
    return this.skAppsResponse?.meta.count || 0;
  }

  get tableData() {
    if (this.isFetchingTableData) {
      return this.mockLoadingData;
    }

    return (this.skAppsResponse?.map((app) => {
      const { appMetadata } = app;

      return {
        title: appMetadata.title,
        appUrl: appMetadata.url,
        isAndroid: appMetadata?.platform === ENUMS.PLATFORM.ANDROID,
        isIos: appMetadata?.platform === ENUMS.PLATFORM.IOS,
        iconUrl: appMetadata?.icon_url,
        name: appMetadata.title,
        packageName: appMetadata.package_name,
        companyName: appMetadata.dev_name,
        devName: appMetadata.dev_name,
        devEmail: appMetadata.dev_email,
        app,
        appIsSelected: this.selectedDisabledAppIds.some(
          (id) => id === (appMetadata.doc_ulid as string)
        ),
      };
    }) || []) as StoreknoxInventoryTableDataItem[];
  }

  get mockLoadingData() {
    return Array.from(new Array(7)).map(() => ({}));
  }

  get showPagination() {
    return !this.isFetchingTableData && this.totalAppsCount > this.limit;
  }

  get isFetchingTableData() {
    return this.fetchSkApps.isRunning;
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

  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.router.transitionTo('authenticated.storeknox.inventory.app-list', {
      queryParams: { app_limit: limit, app_offset: offset },
    });

    this.fetchSkApps.perform();
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;

    this.limit = limit;
    this.offset = 0;

    this.router.transitionTo('authenticated.storeknox.inventory.app-list', {
      queryParams: { app_limit: limit, app_offset: 0 },
    });

    this.fetchSkApps.perform();
  }

  @action handleRowClick(app: StoreknoxInventoryTableDataItem) {
    if (!this.disableRowClick) {
      this.router.transitionTo(
        'authenticated.storeknox.inventory-details.index',
        app.app.id
      );
    }
  }

  fetchSkApps = task(async () => {
    const query = !this.loadDisabledApps
      ? {
          approval_status: ENUMS.SK_APP_APPROVAL_STATUS.APPROVED,
          app_status: ENUMS.SK_APP_STATUS.ACTIVE,
        }
      : {
          app_status: ENUMS.SK_APP_STATUS.INACTIVE,
        };

    try {
      const data = (await this.store.query('sk-app', {
        limit: this.limit,
        offset: this.offset,
        ...query,
      })) as SkAppsQueryResponse;

      this.skAppsResponse = data;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::AppList::Table': typeof StoreknoxInventoryAppListTableComponent;
  }
}
