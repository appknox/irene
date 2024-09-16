import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import { waitForPromise } from '@ember/test-waiters';
import RouterService from '@ember/routing/router-service';
import { action } from '@ember/object';

import SkAppModel from 'irene/models/sk-app';

type SkPendingReviewResponse = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

type skPendingReviewObjType = {
  [id: string]: number;
};

export const DEFAULT_PROJECT_QUERY_PARAMS = {
  query: '',
  platform: -1,
};

export default class SkPendingReviewService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;

  @tracked skPendingReviewData: SkPendingReviewResponse | null = null;
  @tracked skPendingReviewObj: skPendingReviewObjType = {};
  @tracked selectedApps: string[] = [];
  @tracked allRowsSelected: boolean = false;
  @tracked limit: string | number = 10;
  @tracked offset: string | number = 0;
  @tracked showLoading: boolean = true;

  get isFetchingData() {
    return this.fetchPendingReviewApps.isRunning && this.showLoading;
  }

  reset() {
    this.selectedApps = [];
    this.skPendingReviewObj = {};
    this.allRowsSelected = false;
  }

  fetchPendingReviewApps = task(
    { drop: true },
    async (
      limit: string | number = 10,
      offset: string | number = 0,
      setQueryParams = true
    ) => {
      this.limit = limit;
      this.offset = offset;

      if (!this.showLoading) {
        this.reset();
      }

      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        this.skPendingReviewData = (await this.store.query('skApp', {
          limit,
          offset,
          approval_status: 0,
          app_status: 1,
        })) as SkPendingReviewResponse;

        for (const [index, record] of (this.skPendingReviewData
          ? this.skPendingReviewData.slice()
          : []
        ).entries()) {
          this.skPendingReviewObj[record.id] = index;
        }

        this.showLoading = true;
      } catch (e) {
        console.log(e);
      }
    }
  );

  approveRejectApp = task(
    async (id: string, approve: boolean, multiple?: boolean) => {
      const index = this.skPendingReviewObj[id] as number;

      const selectedAppValue = this.skPendingReviewData
        ? this.skPendingReviewData.slice()[index]
        : null;

      selectedAppValue?.set('statusButtonsLoading', true);

      try {
        if (approve) {
          await waitForPromise(this.approveApp(id));
        } else {
          await waitForPromise(this.rejectApp(id));
        }

        if (this.selectedApps.includes(id)) {
          this.selectRow(id, false);
        }

        if (multiple && this.selectedApps.length === 0) {
          this.allRowsSelected = false;
        }

        if (
          Number(this.offset) > 0 &&
          this.totalCount - Number(this.offset) === 1
        ) {
          this.offset = Number(this.offset) - Number(this.limit);
        }

        this.fetchPendingReviewApps.perform(this.limit, this.offset);

        this.showLoading = false;

        if (approve) {
          this.notify.success(
            `${selectedAppValue?.title} App has been moved to App Inventory`
          );
        } else {
          this.notify.success(
            `${selectedAppValue?.title} App has been rejected`
          );
        }
      } catch (error) {
        console.log(error);
      }

      selectedAppValue?.set('statusButtonsLoading', false);
    }
  );

  approveRejectMultipleApp = task(async (approve: boolean) => {
    this.selectedApps.forEach((id) => {
      this.approveRejectApp.perform(id, approve, true);
    });
  });

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  selectRow(id: string, value: boolean, force?: boolean) {
    const index = this.skPendingReviewObj[id] as number;

    const selectedResult = this.skPendingReviewData
      ? this.skPendingReviewData.slice()[index]
      : null;

    selectedResult?.set('selected', value);

    if (force && !value) {
      return;
    }

    const idx = this.selectedApps.indexOf(id);

    if (idx !== -1) {
      this.selectedApps.removeObject(id);
    } else {
      this.selectedApps.pushObject(id);
    }

    this.checkIfAllSelected();
  }

  @action
  async approveApp(id: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.approveApp(id);
  }

  @action
  async rejectApp(id: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.rejectApp(id);
  }

  selectAllRow(value: boolean) {
    this.selectedApps.clear();

    for (const record of this.skPendingReviewData
      ? this.skPendingReviewData.slice()
      : []) {
      this.selectRow(record.id, value, true);
    }
  }

  checkIfAllSelected() {
    const pendingReviewDataLength = this.skPendingReviewData
      ? this.skPendingReviewData.slice().length
      : 0;

    this.allRowsSelected = this.selectedApps.length === pendingReviewDataLength;
  }

  get totalCount() {
    return this.skPendingReviewData?.meta?.count || 0;
  }
}
