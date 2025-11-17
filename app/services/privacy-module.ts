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
import type PiiModel from 'irene/models/pii';
import type GeoLocationModel from 'irene/models/geo-location';
import type PiiRequestModel from 'irene/models/pii-request';

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

  @tracked
  trackerDataList?: DS.AdapterPopulatedRecordArray<TrackersModel>;

  @tracked
  dangerousPermissionList?: DS.AdapterPopulatedRecordArray<DangerousPermissionModel>;

  @tracked trackerDataCount: number = 0;
  @tracked dangerousPermissionCount: number = 0;
  @tracked piiDataCount: number = 0;
  @tracked piiDataList: PiiModel[] = [];
  @tracked piiDataAvailable: boolean = false;
  @tracked showCompleteApiScanNote: boolean = false;
  @tracked showPiiUpdated: boolean = false;
  @tracked selectedPiiId: string | null = null;
  @tracked showNote: boolean = true;
  @tracked geoLocationDataCount: number = 0;
  @tracked geoLocationDataList: GeoLocationModel[] = [];
  @tracked showGeoUpdated: boolean = false;
  @tracked showCompleteDastScanNote: boolean = false;
  @tracked geoDataAvailable: boolean = false;
  @tracked pii: PiiRequestModel | null = null;

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
    this.piiDataCount = 0;
    this.geoLocationDataCount = 0;
    this.piiDataAvailable = false;
    this.showCompleteApiScanNote = false;
    this.showPiiUpdated = false;
    this.selectedPiiId = null;
    this.showNote = true;
    this.geoLocationDataList = [];
    this.showCompleteDastScanNote = false;
    this.showGeoUpdated = false;
    this.geoDataAvailable = false;
  }

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

  fetchPiiData = task(async (fileId, privacyProjectId, markPiiSeen = false) => {
    try {
      const pii = await this.getPiiRequest.perform(fileId);

      this.selectedPiiId = pii.id;
      this.pii = pii;

      if (
        pii.status === ENUMS.PM_PII_STATUS.SUCCESS ||
        pii.status === ENUMS.PM_PII_STATUS.PARTIAL_SUCCESS
      ) {
        const queryParams = {
          fileId: fileId,
          piiExtractionId: pii.id,
        };

        const piiData = await this.store.query('pii', queryParams);
        const piiDataList = piiData.slice() as PiiModel[];

        this.piiDataList = piiDataList;
        this.piiDataCount = piiDataList.length;
        this.piiDataAvailable = true;

        if (pii.status === ENUMS.PM_PII_STATUS.PARTIAL_SUCCESS) {
          this.showCompleteApiScanNote = true;
        } else {
          if (markPiiSeen && this.showPiiUpdated && privacyProjectId) {
            const adapter = this.store.adapterFor('pii');

            this.showPiiUpdated = false;

            const privacyProject = await this.store.findRecord(
              'privacy-project',
              privacyProjectId
            );

            privacyProject.set('piiHighlight', false);

            await privacyProject.save();

            if (!privacyProject.geoHighlight) {
              adapter.markPrivacySeen(privacyProjectId);
            }
          }
        }
      }
    } catch (err) {
      const error = err as AdapterError;
      const status = error.errors?.[0]?.status;

      if (status == 404) {
        this.piiDataAvailable = false;
      } else {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  });

  getPiiRequest = task(async (fileId) => {
    const adapter = this.store.adapterFor('pii-request');
    adapter.setNestedUrlNamespace(String(fileId));

    return await this.store.queryRecord('pii-request', {});
  });

  fetchGeoLocationData = task(
    async (fileId, privacyProjectId, markSeen = false) => {
      try {
        const geoLocation = await this.getGeoLocationRequest.perform(fileId);

        if (
          geoLocation.status === ENUMS.PM_PII_STATUS.SUCCESS ||
          geoLocation.status === ENUMS.PM_PII_STATUS.PARTIAL_SUCCESS
        ) {
          const queryParams = {
            geoLocationId: geoLocation.id,
          };

          const geoLocationDataList = (
            await this.store.query('geo-location', queryParams)
          ).toArray() as GeoLocationModel[];

          this.geoLocationDataList = geoLocationDataList;
          this.geoLocationDataCount = geoLocationDataList.length;
          this.geoDataAvailable = true;

          if (
            geoLocation.status === ENUMS.PM_PII_STATUS.PARTIAL_SUCCESS &&
            this.pii?.status !== ENUMS.PM_PII_STATUS.PENDING &&
            this.pii?.status !== ENUMS.PM_PII_STATUS.FAILED
          ) {
            this.showCompleteDastScanNote = true;
          } else {
            if (markSeen && this.showGeoUpdated && privacyProjectId) {
              const adapter = this.store.adapterFor('pii');

              this.showGeoUpdated = false;

              const privacyProject = await this.store.findRecord(
                'privacy-project',
                privacyProjectId
              );

              privacyProject.set('geoHighlight', false);

              await privacyProject.save();

              if (!privacyProject.piiHighlight) {
                adapter.markPrivacySeen(privacyProjectId);
              }
            }
          }
        }
      } catch (err) {
        const error = err as AdapterError;

        if (error.errors) {
          const status = error.errors[0]?.status;

          if (status == 404) {
            this.geoDataAvailable = false;
          } else {
            this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
          }
        }
      }
    }
  );

  getGeoLocationRequest = task(async (fileId) => {
    const adapter = this.store.adapterFor('geo-request');
    adapter.setNestedUrlNamespace(String(fileId));

    return await this.store.queryRecord('geo-request', {});
  });
}
