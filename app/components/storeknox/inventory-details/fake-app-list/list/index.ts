import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkFakeAppsListService from 'irene/services/sk-fake-apps-list';
import type { FindingDetail } from 'irene/components/storeknox/inventory-details/finding-detail-card';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

export interface StoreknoxInventoryDetailsFakeAppListListSignature {
  Args: {
    emptyIllustration?:
      | 'ak-svg/no-pending-items'
      | 'ak-svg/project-list-empty'
      | 'ak-svg/scan-completed';

    emptyTitle?: string;
    skInventoryApp: SkInventoryAppModel;
    appsQueryStatus?: 'pending' | 'ignored';
    appsQueryClassification?: 'brand_abuse' | 'fake_app';
  };
}

export default class StoreknoxInventoryDetailsFakeAppListListComponent extends Component<StoreknoxInventoryDetailsFakeAppListListSignature> {
  @service('sk-fake-apps-list')
  declare skFakeAppsListService: SkFakeAppsListService;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsFakeAppListListSignature['Args']
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

  get fakeAppsWithFindings(): Array<{
    skFakeApp: SkFakeAppModel;
    finding: FindingDetail;
  }> {
    return this.skFakeApps.map((skFakeApp) => ({
      skFakeApp,
      finding: this._buildFinding(skFakeApp),
    }));
  }

  _buildFinding(skFakeApp: SkFakeAppModel): FindingDetail {
    const scores = skFakeApp.aiScores;

    return {
      id: String(skFakeApp.id),
      overallScore: Math.round((skFakeApp.confidenceScore ?? 0) * 100),
      semanticScore: Math.round((scores?.SemanticSimilarityRule ?? 0) * 100),
      packageScore: Math.round((scores?.PackageSimilarityRule ?? 0) * 100),
      logoScore: Math.round((scores?.LogoSimilarityRule ?? 0) * 100),
      developerScore: Math.round((scores?.DeveloperConsistencyRule ?? 0) * 100),
      appLogoUrl: skFakeApp.fakeAppIconUrl,
      appName: skFakeApp.title,
      namespace: skFakeApp.packageName,
      isAndroid: skFakeApp.isAndroid,
      developer: skFakeApp.devName,
      isIgnored: skFakeApp.isIgnored || skFakeApp.isAddedToInventory,
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::FakeAppList::List': typeof StoreknoxInventoryDetailsFakeAppListListComponent;
  }
}
