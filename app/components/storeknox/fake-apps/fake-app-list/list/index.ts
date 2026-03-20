import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkFakeAppsListService from 'irene/services/sk-fake-apps-list';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

export interface FakeAppTableRowData {
  id: string;
  appLogoUrl?: string;
  appName: string;
  namespace: string;
  isAndroid: boolean;
  developer: string;
  confidence: number;
  appUrl?: string;
  skFakeApp: SkFakeAppModel;
  skInventoryApp: SkInventoryAppModel;
}

export interface StoreknoxFakeAppsFakeAppListListSignature {
  Args: {
    emptyIllustration?:
      | 'ak-svg/no-pending-items'
      | 'ak-svg/project-list-empty'
      | 'ak-svg/scan-completed';

    emptyTitle?: string;
    emptyDescription?: string;
    infoText?: string;
    skInventoryApp: SkInventoryAppModel;
    appsQueryStatus?: 'pending' | 'ignored';
    appsQueryClassification?: 'brand_abuse' | 'fake_app';
  };
}

export default class StoreknoxFakeAppsFakeAppListListComponent extends Component<StoreknoxFakeAppsFakeAppListListSignature> {
  @service('sk-fake-apps-list')
  declare skFakeAppsListService: SkFakeAppsListService;

  @service declare intl: IntlService;
  @service declare router: RouterService;

  constructor(
    owner: unknown,
    args: StoreknoxFakeAppsFakeAppListListSignature['Args']
  ) {
    super(owner, args);

    const appsQueryClassification =
      args.appsQueryStatus === 'ignored' ? null : args.appsQueryClassification;

    this.skFakeAppsListService
      .setQueryParams({
        skInventoryApp: args.skInventoryApp,
        limit: 10,
        offset: 0,
        appsQueryStatus: args.appsQueryStatus,
        appsQueryClassification,
      })
      .fetch.perform();
  }

  get skFakeApps() {
    return this.skFakeAppsListService.skFakeApps;
  }

  get isFetchingData() {
    return this.skFakeAppsListService.isFetching;
  }

  get totalCount() {
    return this.skFakeAppsListService.totalCount;
  }

  get limit() {
    return this.skFakeAppsListService.limit;
  }

  get offset() {
    return this.skFakeAppsListService.offset;
  }

  get hasNoResults() {
    return !this.isFetchingData && this.totalCount === 0;
  }

  get showActionColumn() {
    return this.args.appsQueryStatus !== 'ignored';
  }

  get columns() {
    return [
      {
        name: this.intl.t('platform'),
        cellComponent:
          'storeknox/fake-apps/fake-app-list/table/platform' as const,
        width: 80,
        textAlign: 'center',
      },
      {
        name: this.intl.t('storeknox.store'),
        cellComponent: 'storeknox/fake-apps/fake-app-list/table/store' as const,
        width: 80,
        textAlign: 'center',
      },
      {
        name: this.intl.t('storeknox.fakeApps.logo'),
        cellComponent: 'storeknox/fake-apps/fake-app-list/table/logo' as const,
        width: 80,
      },
      {
        name: this.intl.t('appName'),
        cellComponent:
          'storeknox/fake-apps/fake-app-list/table/app-name' as const,
        width: 250,
      },
      {
        name: this.intl.t('namespace'),
        cellComponent:
          'storeknox/fake-apps/fake-app-list/table/namespace' as const,
        width: 200,
      },
      {
        name: this.intl.t('developer'),
        cellComponent:
          'storeknox/fake-apps/fake-app-list/table/developer' as const,
        width: 200,
      },
      {
        name: this.intl.t('storeknox.fakeApps.confidence'),
        cellComponent:
          'storeknox/fake-apps/fake-app-list/table/confidence' as const,
        width: 100,
      },
      this.showActionColumn && {
        name: this.intl.t('action'),
        cellComponent:
          'storeknox/fake-apps/fake-app-list/table/action' as const,
        width: 80,
        textAlign: 'center',
      },
    ].filter(Boolean);
  }

  get tableData(): FakeAppTableRowData[] {
    if (this.isFetchingData) {
      return this.mockLoadingData;
    }

    return this.skFakeApps.map((skFakeApp) => ({
      id: String(skFakeApp.id),
      appLogoUrl: skFakeApp.fakeAppIconUrl,
      appName: skFakeApp.title,
      namespace: skFakeApp.packageName,
      isAndroid: skFakeApp.isAndroid,
      developer: skFakeApp.devName,
      confidence: Math.round((skFakeApp.aiScores?.final ?? 0) * 100),
      appUrl: skFakeApp.appUrl,
      skFakeApp,
      skInventoryApp: this.args.skInventoryApp,
    }));
  }

  get mockLoadingData(): FakeAppTableRowData[] {
    return Array.from(new Array(5)).map(() => ({}) as FakeAppTableRowData);
  }

  @action
  onRowClick({ rowValue }: { rowValue: FakeAppTableRowData }) {
    this.router.transitionTo(
      'authenticated.storeknox.fake-apps.fake-app-details',
      rowValue.skInventoryApp.id,
      rowValue.skFakeApp.id
    );
  }

  @action
  goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.skFakeAppsListService
      .setQueryParams({ limit, offset })
      .fetch.perform();
  }

  @action
  onItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.skFakeAppsListService
      .setQueryParams({ limit, offset: 0 })
      .fetch.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::List': typeof StoreknoxFakeAppsFakeAppListListComponent;
  }
}
