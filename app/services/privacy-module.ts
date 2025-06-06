import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
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
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked trackerDataCount: number = 0;
  @tracked
  trackerDataList?: DS.AdapterPopulatedRecordArray<TrackersModel>;
  @tracked
  dangerousPermissionList?: DS.AdapterPopulatedRecordArray<DangerousPermissionModel>;
  @tracked dangerousPermissionCount: number = 0;

  fetchTrackerData = task(
    async (limit, offset, fileId, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        const tracker = await this.getTrackerRequest.perform(fileId);

        if (tracker.status === ENUMS.PM_TRACKER_STATUS.SUCCESS) {
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
        }
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  getTrackerRequest = task(async (fileId) => {
    const adapter = this.store.adapterFor('tracker-request');
    adapter.setNestedUrlNamespace(String(fileId));

    return await this.store.queryRecord('tracker-request', {});
  });

  fetchDangerousPermission = task(
    async (limit, offset, fileId, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        const permission = await this.getPermissionRequest.perform(fileId);

        if (permission.status === ENUMS.PM_DANGER_PERMS_STATUS.SUCCESS) {
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
        }
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  getPermissionRequest = task(async (fileId) => {
    const adapter = this.store.adapterFor('dangerous-permission-request');
    adapter.setNestedUrlNamespace(String(fileId));

    return await this.store.queryRecord('dangerous-permission-request', {});
  });

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  // Resets the count values to ensure the previous record's counts do not persist
  resetCountValues() {
    this.trackerDataCount = 0;
    this.dangerousPermissionCount = 0;
  }
}
