import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type OrganizationUserModel from './organization-user';
import type SkAppMetadataModel from './sk-app-metadata';
import type SkOrganizationModel from './sk-organization';

export interface AvailabilityData {
  storeknox: boolean;
  appknox: boolean;
}

export default class SkAppModel extends Model {
  @service declare intl: IntlService;

  @attr('number')
  declare appDiscoveryQuery: number;

  @attr('number')
  declare approvalStatus: number;

  @attr('string')
  declare approvalStatusDisplay: string;

  @attr('number')
  declare appStatus: number;

  @attr('string')
  declare appStatusDisplay: string;

  @attr('number')
  declare appSource: number;

  @attr('string')
  declare appSourceDisplay: string;

  @attr('boolean')
  declare monitoringEnabled: boolean;

  @attr('number')
  declare storeMonitoringStatus: number;

  @attr('string')
  declare storeMonitoringStatusDisplay: string;

  @attr('date')
  declare approvedOn: Date;

  @attr('date')
  declare addedOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare rejectedOn: Date;

  @attr('date')
  declare archivedOn: Date;

  @attr('date')
  declare unarchiveAvailableOn: Date;

  @attr('string')
  declare archivedBy: string;

  @attr('number')
  declare licenseAllocated: number;

  @belongsTo('sk-app-metadata', { async: false, inverse: null })
  declare appMetadata: SkAppMetadataModel;

  @attr()
  declare availability: AvailabilityData;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare addedBy: AsyncBelongsTo<OrganizationUserModel>;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare approvedBy: AsyncBelongsTo<OrganizationUserModel> | string;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare rejectedBy: AsyncBelongsTo<OrganizationUserModel> | string;

  @belongsTo('sk-organization', { async: true, inverse: null })
  declare skOrganization: AsyncBelongsTo<SkOrganizationModel>;

  get docUlid() {
    return this.appMetadata.get('docUlid');
  }

  get iconUrl() {
    return this.appMetadata.get('iconUrl');
  }

  get packageName() {
    return this.appMetadata.get('packageName');
  }

  get appUrl() {
    return this.appMetadata.get('url');
  }

  get title() {
    return this.appMetadata.get('title');
  }

  get devName() {
    return this.appMetadata.get('devName');
  }

  get devEmail() {
    return this.appMetadata.get('devEmail');
  }

  get isAndroid() {
    return this.appMetadata.get('platform') === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return !!(this.appMetadata.get('platform') === ENUMS.PLATFORM.IOS);
  }

  get monitoringStatusIsPending() {
    return (
      this.storeMonitoringStatus === ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING
    );
  }

  get monitoringPendingOrDisabled() {
    return [
      ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
      ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
    ].includes(this.storeMonitoringStatus);
  }

  get isArchived() {
    return !!this.archivedOn && this.appStatus === ENUMS.SK_APP_STATUS.ARCHIVED;
  }

  get isApproved() {
    return this.approvalStatus === ENUMS.SK_APPROVAL_STATUS.APPROVED;
  }

  get unarchiveDateString() {
    return dayjs(this.unarchiveAvailableOn).format('MMM DD, YYYY');
  }

  get canUnarchive() {
    return this.archivedOn && dayjs().isAfter(this.unarchiveAvailableOn);
  }

  get hasLicense() {
    return this.licenseAllocated > 0;
  }

  async approveApp(id: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.approveApp(id);
  }

  async rejectApp(id: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.rejectApp(id);
  }

  async toggleMonitoring(checked: boolean) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.toggleMonitoring(this.id, checked);
  }

  async initiateAppUpload() {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.initiateAppUpload(this.id);
  }

  async toggleArchiveStatus() {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.toggleArchiveStatus(this);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-app': SkAppModel;
  }
}
