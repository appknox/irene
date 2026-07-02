import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { FakeAppCounts } from 'irene/models/sk-app';

type SkFakeAppResponse = DS.AdapterPopulatedRecordArray<SkFakeAppModel> & {
  meta: { count: number };
};

export default class SkFakeAppsListService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked skInventoryApp?: SkInventoryAppModel;
  @tracked fakeAppCounts?: FakeAppCounts;
  @tracked skFakeApps: SkFakeAppModel[] = [];
  @tracked totalCount = 0;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked appsQueryStatus?: 'pending' | 'ignored';
  @tracked appsQueryClassification?: 'brand_abuse' | 'fake_app';

  get isFetching() {
    return this.fetch.isRunning;
  }

  @action
  setQueryParams({
    skInventoryApp,
    limit,
    offset,
    appsQueryStatus,
    appsQueryClassification,
  }: {
    skInventoryApp?: SkInventoryAppModel;
    limit?: number;
    offset?: number;
    appsQueryStatus?: 'pending' | 'ignored';
    appsQueryClassification?: 'brand_abuse' | 'fake_app' | null;
  }) {
    if (skInventoryApp !== undefined) {
      this.skInventoryApp = skInventoryApp;
    }
    if (limit !== undefined) {
      this.limit = limit;
    }
    if (offset !== undefined) {
      this.offset = offset;
    }
    if (appsQueryStatus !== undefined) {
      this.appsQueryStatus = appsQueryStatus;
    }

    // Allow explicit clearing of classification (by passing null),
    // while still ignoring omitted (undefined) values.
    if (appsQueryClassification !== undefined) {
      this.appsQueryClassification = appsQueryClassification ?? undefined;
    }

    return this;
  }

  async reload() {
    await this.skInventoryApp?.reload();
    this.fakeAppCounts = this.skInventoryApp?.fakeAppCounts;
    this.fetch.perform();
  }

  fetch = task({ keepLatest: true }, async () => {
    const skAppId = this.skInventoryApp?.id;

    if (!skAppId) {
      return;
    }

    const query: Record<string, unknown> = {
      sk_app_id: skAppId,
      limit: this.limit,
      offset: this.offset,
    };

    if (this.appsQueryStatus !== undefined) {
      query['status'] = this.appsQueryStatus;
    }

    if (this.appsQueryClassification) {
      query['classification'] = this.appsQueryClassification;
    }

    try {
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

declare module '@ember/service' {
  interface Registry {
    'sk-fake-apps-list': SkFakeAppsListService;
  }
}
