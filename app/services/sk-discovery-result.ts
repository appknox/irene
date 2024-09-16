import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import { waitForPromise } from '@ember/test-waiters';
import RouterService from '@ember/routing/router-service';

import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

type SkDiscoveryResultResponse =
  DS.AdapterPopulatedRecordArray<SkDiscoverySearchResultModel> & {
    meta: { count: number };
  };

type skDiscoveryResultObjType = {
  [id: string]: number;
};

export const DEFAULT_PROJECT_QUERY_PARAMS = {
  query: '',
  platform: -1,
};

export default class SkDiscoveryResultService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  @tracked skDiscoveryResultData: SkDiscoveryResultResponse | null = null;
  @tracked skDiscoveryResultObj: skDiscoveryResultObjType = {};
  @tracked searchId: string | number = '';
  @tracked selectedResults: string[] = [];
  @tracked allRowsSelected: boolean = false;
  @tracked requestedCount = 0;

  get isFetchingData() {
    return (
      this.fetchDiscoveryResults.isRunning || this.uploadSearchQuery.isRunning
    );
  }

  uploadSearchQuery = task(
    async (
      searchQuery: string,
      limit: string | number,
      offset: string | number,
      setQueryParams = false
    ) => {
      try {
        const discoveryQuery = this.store.createRecord('skDiscovery', {
          queryStr: searchQuery,
        });

        const uploadedDiscovery = await waitForPromise(discoveryQuery.save());

        this.router.transitionTo('authenticated.storeknox.discover.result', {
          queryParams: { app_search_id: uploadedDiscovery.id },
        });

        this.fetchDiscoveryResults.perform(
          limit,
          offset,
          uploadedDiscovery.id,
          setQueryParams
        );
      } catch (error) {
        console.log(error);
      }
    }
  );

  reset() {
    this.selectedResults = [];
    this.skDiscoveryResultObj = {};
    this.allRowsSelected = false;
    this.requestedCount = 0;
  }

  fetchDiscoveryResults = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      searchId: string | number,
      setQueryParams = true
    ) => {
      this.reset();

      this.searchId = searchId;

      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, searchId);
      }

      try {
        this.skDiscoveryResultData = (await this.store.query(
          'skDiscoveryResult',
          {
            limit,
            offset,
            id: searchId,
          }
        )) as SkDiscoveryResultResponse;

        this.removeQueryParamFromStoredUrl();

        for (const [index, record] of (this.skDiscoveryResultData
          ? this.skDiscoveryResultData.slice()
          : []
        ).entries()) {
          this.skDiscoveryResultObj[record.docUlid] = index;

          try {
            const approvalStatus = await this.store.queryRecord(
              'skInventoryApprovalStatus',
              {
                doc_ulid: record.docUlid,
              }
            );

            record.set('requested', true);

            if (approvalStatus.approvalStatus === 1) {
              record.set('approved', true);
            }

            this.requestedCount++;
          } catch (e: any) {
            if (e?.errors && e.errors[0]?.status === '404') {
              record.set('requested', false);

              record.set('selected', false);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  );

  removeQueryParamFromStoredUrl() {
    const transInfo = this.window.sessionStorage.getItem('_lastTransitionInfo');

    if (transInfo) {
      const transInfoObj = JSON.parse(transInfo);

      if (transInfoObj.url) {
        transInfoObj.url = transInfoObj.url.split('?')[0];
      }

      this.window.sessionStorage.setItem(
        '_lastTransitionInfo',
        JSON.stringify(transInfoObj)
      );
    }
  }

  addToInventory = task(async (ulid: string, multiple?: boolean) => {
    const index = this.skDiscoveryResultObj[ulid] as number;

    const selectedResult = this.skDiscoveryResultData
      ? this.skDiscoveryResultData.slice()[index]
      : null;

    selectedResult?.set('addButtonLoading', true);

    try {
      const addToInventoryQuery = this.store.createRecord('skAddToInventory', {
        docUlid: ulid,
        appDiscoveryQuery: this.searchId,
      });

      const res = await waitForPromise(addToInventoryQuery.save());

      selectedResult?.set('requested', true);

      if (res.approvalStatus === 1) {
        selectedResult?.set('approved', true);

        this.notify.success('Added to App Inventory');
      } else if (res.approvalStatus === 0) {
        this.notify.success('Request has been successfully sent');
      }

      this.requestedCount++;

      if (this.selectedResults.includes(ulid)) {
        this.selectRow(ulid, false);
      }

      if (multiple && this.selectedResults.length === 0) {
        this.allRowsSelected = false;
      }
    } catch (error) {
      console.log(error);
    }

    selectedResult?.set('addButtonLoading', false);

    if (multiple && this.selectedResults.length === 0) {
      this.notify.success('All requests have been successfully sent');
    }
  });

  addMultipleToInventory = task(async () => {
    this.selectedResults.forEach((ulid) => {
      this.addToInventory.perform(ulid, true);
    });
  });

  setRouteQueryParams(
    limit: string | number,
    offset: string | number,
    searchId: string | number
  ) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
        app_search_id: searchId,
      },
    });
  }

  selectRow(ulid: string, value: boolean, force?: boolean) {
    const index = this.skDiscoveryResultObj[ulid] as number;

    const selectedResult = this.skDiscoveryResultData
      ? this.skDiscoveryResultData.slice()[index]
      : null;

    selectedResult?.set('selected', value);

    if (force && !value) {
      return;
    }

    const idx = this.selectedResults.indexOf(ulid);

    if (idx !== -1) {
      this.selectedResults.removeObject(ulid);
    } else {
      this.selectedResults.pushObject(ulid);
    }

    this.checkIfAllSelected();
  }

  selectAllRow(value: boolean) {
    this.selectedResults.clear();

    for (const record of this.skDiscoveryResultData
      ? this.skDiscoveryResultData.slice()
      : []) {
      if (!record.requested) {
        this.selectRow(record.docUlid, value, true);
      }
    }
  }

  checkIfAllSelected() {
    const discoveryResultDataLength = this.skDiscoveryResultData
      ? this.skDiscoveryResultData.slice().length
      : 0;

    if (
      this.requestedCount + this.selectedResults.length ===
      discoveryResultDataLength
    ) {
      this.allRowsSelected = true;
    } else {
      this.allRowsSelected = false;
    }
  }
}
