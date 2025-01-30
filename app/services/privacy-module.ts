import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import TrackerRequestModel, {
  TrackerStatus,
} from 'irene/models/tracker-request';
import DangerousPermissionRequestModel, {
  DangerPermsStatus,
} from 'irene/models/dangerous-permission-request';
import parseError from 'irene/utils/parse-error';
import { PrivacyStatus } from 'irene/models/privacy-project';
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
  @tracked trackerRequest: TrackerRequestModel | null = null;
  @tracked permissionRequest: DangerousPermissionRequestModel | null = null;
  @tracked privacyStatus: PrivacyStatus | null = null;

  fetchTrackerData = task(
    async (limit, offset, fileId, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        const tracker = await this.getTrackerRequest.perform(fileId);

        this.trackerRequest = tracker;

        if (tracker.status === TrackerStatus.SUCCESS) {
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
    try {
      const tracker = await this.store.queryRecord('tracker-request', {
        fileId,
      });

      return tracker;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      throw error;
    }
  });

  fetchDangerousPermission = task(
    async (limit, offset, fileId, setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        const permission = await this.getPermissionRequest.perform(fileId);

        this.permissionRequest = permission;

        if (permission.status === DangerPermsStatus.SUCCESS) {
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
    try {
      const permission = await this.store.queryRecord(
        'dangerous-permission-request',
        {
          fileId,
        }
      );

      return permission;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      throw error;
    }
  });

  async getPrivacyAppStatus(fileId: any) {
    const tracker =
      this.trackerRequest ?? (await this.getTrackerRequest.perform(fileId));

    const permission =
      this.permissionRequest ??
      (await this.getPermissionRequest.perform(fileId));

    if (
      tracker.status === TrackerStatus.FAILED ||
      permission.status === DangerPermsStatus.FAILED
    ) {
      this.privacyStatus = PrivacyStatus.FAILED;

      return;
    }

    if (
      tracker.status === TrackerStatus.STARTED ||
      tracker.status === TrackerStatus.PENDING ||
      permission.status === DangerPermsStatus.STARTED ||
      permission.status === DangerPermsStatus.PENDING
    ) {
      this.privacyStatus = PrivacyStatus.IN_PROGRESS;

      return;
    }

    this.privacyStatus = PrivacyStatus.COMPLETED;
  }

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }
}
