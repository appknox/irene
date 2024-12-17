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
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { StoreknoxCommonTableColumnsData } from 'irene/components/storeknox/table-columns';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type { StoreknoxInventoryAppListQueryParams } from 'irene/routes/authenticated/storeknox/inventory/app-list';

type SkAppsQueryResponse =
  DS.AdapterPopulatedRecordArray<SkInventoryAppModel> & {
    meta: { count: number };
  };

type StoreknoxInventoryTableDataItem = StoreknoxCommonTableColumnsData & {
  appIsSelected: boolean;
  app: SkInventoryAppModel;
};

export interface StoreknoxInventoryAppListTableSignature {
  Element: HTMLElement;
  Args: {
    isAddingAppToInventory?: boolean;
    loadDisabledApps?: boolean;
    queryParams: StoreknoxInventoryAppListQueryParams;
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
  @tracked selectedDisabledAppSet = new Set<string>();
  @tracked selectedDisabledAppIds: string[] = [];

  constructor(
    owner: Owner,
    args: StoreknoxInventoryAppListTableSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset } = args.queryParams;

    this.fetchSkInventoryApps.perform(app_limit, app_offset, false);
  }

  get loadDisabledApps() {
    return this.args.loadDisabledApps;
  }

  get disableRowClick() {
    return this.loadDisabledApps || this.fetchSkInventoryApps.isRunning;
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
    return this.fetchSkInventoryApps.isRunning;
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
    this.fetchSkInventoryApps.perform(limit, offset);
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    this.fetchSkInventoryApps.perform(args.limit, 0);
  }

  @action updateRouteParams(limit: number, offset: number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
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

  fetchSkInventoryApps = task(
    async (limit: number, offset: number, updateQueryParams = true) => {
      if (updateQueryParams) {
        this.updateRouteParams(limit, offset);
      }

      const query = !this.loadDisabledApps
        ? {
            approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
            app_status: ENUMS.SK_APP_STATUS.ACTIVE,
          }
        : {
            app_status: ENUMS.SK_APP_STATUS.INACTIVE,
          };

      try {
        const data = (await this.store.query('sk-app', {
          limit: limit,
          offset: offset,
          ...query,
        })) as SkAppsQueryResponse;

        this.skAppsResponse = data;
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('somethingWentWrong')));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::AppList::Table': typeof StoreknoxInventoryAppListTableComponent;
  }
}
