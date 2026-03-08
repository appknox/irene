import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { FindingDetail } from 'irene/components/storeknox/inventory-details/finding-detail-card';

type SkFakeAppResponse = DS.AdapterPopulatedRecordArray<SkFakeAppModel> & {
  meta: { count: number };
};

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
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked skFakeApps: SkFakeAppModel[] = [];
  @tracked totalCount = 0;
  @tracked limit = 10;
  @tracked offset = 0;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsFakeAppListListSignature['Args']
  ) {
    super(owner, args);

    this.fetchFakeApps.perform();
  }

  @action goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchFakeApps.perform();
  }

  @action onItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchFakeApps.perform();
  }

  get isFetchingData() {
    return this.fetchFakeApps.isRunning;
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

  reloadFakeApps = task(async () => {
    await this.args.skInventoryApp.reload();
    await this.fetchFakeApps.perform();
  });

  fetchFakeApps = task(async () => {
    const skAppId = this.args.skInventoryApp?.id;

    if (!skAppId) {
      return;
    }

    try {
      const query: Record<string, unknown> = {
        sk_app_id: skAppId,
        limit: this.limit,
        offset: this.offset,
      };

      if (this.args.appsQueryStatus !== undefined) {
        query['status'] = this.args.appsQueryStatus;
      }

      if (this.args.appsQueryClassification) {
        query['classification'] = this.args.appsQueryClassification;
      }

      const result = (await this.store.query(
        'sk-fake-app',
        query
      )) as SkFakeAppResponse;

      this.totalCount = result.meta.count;
      this.skFakeApps = result.slice();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::FakeAppList::List': typeof StoreknoxInventoryDetailsFakeAppListListComponent;
  }
}
