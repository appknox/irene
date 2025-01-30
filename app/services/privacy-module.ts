import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import type TrackersModel from 'irene/models/trackers';
import type DangerousPermissionModel from 'irene/models/dangerous-permission';

type TrackersModelArray = DS.AdapterPopulatedRecordArray<TrackersModel> & {
  meta: { count: number };
};

type DangerousPermissionModelArray =
  DS.AdapterPopulatedRecordArray<DangerousPermissionModel> & {
    meta: { count: number };
  };

export default class PrivacyModuleService extends Service {
  @tracked expandFileDetailsSummaryFileId: string | null = null;
  @tracked trackerDataCount: number = 0;
  @tracked
  trackerDataList?: DS.AdapterPopulatedRecordArray<TrackersModel>;
  @tracked
  dangerousPermissionList?: DS.AdapterPopulatedRecordArray<DangerousPermissionModel>;
  @tracked dangerousPermissionCount: number = 0;

  @service declare store: Store;
  @service declare router: RouterService;

  fetchTrackerData = task(
    async (limit, offset, fileId, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        const tracker = await this.store.queryRecord('tracker-request', {
          fileId: fileId,
        });

        const queryParams = {
          limit: limit,
          offset: offset,
          fileId: fileId,
          trackerId: tracker.id,
        };

        const trackerDataList = (await this.store.query(
          'trackers',
          queryParams
        )) as TrackersModelArray;

        this.trackerDataList = trackerDataList;
        this.trackerDataCount = trackerDataList.meta.count;
      } catch (error) {
        console.log(error);
      }
    }
  );

  fetchDangerousPermission = task(
    async (limit, offset, fileId, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        const permission = await this.store.queryRecord(
          'dangerous-permission-request',
          {
            fileId: fileId,
          }
        );

        const queryParams = {
          limit: limit,
          offset: offset,
          fileId: fileId,
          permissionId: permission.id,
        };

        const dangerousPermissionList = (await this.store.query(
          'dangerous-permission',
          queryParams
        )) as DangerousPermissionModelArray;

        this.dangerousPermissionList = dangerousPermissionList;
        this.dangerousPermissionCount = dangerousPermissionList.meta.count;
      } catch (error) {
        console.log(error);
      }
    }
  );

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }
}
