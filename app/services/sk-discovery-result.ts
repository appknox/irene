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
      offset: string | number
    ) => {
      try {
        console.log(searchQuery);
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
          false
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

        for (const [index, record] of this.skDiscoveryResultData
          ?.toArray()
          .entries()) {
          this.skDiscoveryResultObj[record.docUlid] = index;

          //TODO: Change once backend changes
          try {
            await this.store.queryRecord('skInventoryApprovalStatus', {
              doc_ulid: record.docUlid,
            });
          } catch (e: any) {
            if (e?.errors && e.errors[0]?.status === '404') {
              record.set('requested', false);

              record.set('selected', false);
            } else {
              record.set('requested', true);

              this.requestedCount++;
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  );

  addToInventory = task(async (ulid: string, multiple?: boolean) => {
    const index = this.skDiscoveryResultObj[ulid] as number;

    let selectedResult: SkDiscoverySearchResultModel | null = null;

    selectedResult = this.skDiscoveryResultData?.toArray()[index] ?? null;

    selectedResult?.set('add_button_loading', true);

    try {
      const addToInventoryQuery = this.store.createRecord('skAddToInventory', {
        docUlid: ulid,
        appDiscoveryQuery: this.searchId,
      });

      const res = await waitForPromise(addToInventoryQuery.save());

      selectedResult?.set('requested', true);

      if (res.approvalStatus === 0) {
        selectedResult?.set('approved', true);
      }

      this.requestedCount++;

      this.selectRow(ulid, false);

      if (multiple && this.selectedResults.length === 0) {
        this.allRowsSelected = false;
      }
    } catch (error) {
      console.log(error);
    }

    selectedResult?.set('add_button_loading', false);
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

    let selectedResult: SkDiscoverySearchResultModel | null = null;

    selectedResult = this.skDiscoveryResultData?.toArray()[index] ?? null;

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

    for (const record of this.skDiscoveryResultData?.toArray() || []) {
      if (!record.requested) {
        this.selectRow(record.docUlid, value, true);
      }
    }
  }

  checkIfAllSelected() {
    if (
      this.requestedCount + this.selectedResults.length ===
      this.skDiscoveryResultData?.toArray().length
    ) {
      this.allRowsSelected = true;
    } else {
      this.allRowsSelected = false;
    }
  }
}
