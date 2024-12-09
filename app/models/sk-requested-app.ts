import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import type OrganizationUserModel from './organization-user';
import type SkAppMetadataModel from './sk-app-metadata';

export interface AvailabilityData {
  storeknox: boolean;
  appknox: boolean;
}

enum SkAppStatus {
  PENDING_APPROVAL = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export default class SkRequestedAppModel extends Model {
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
  declare monitoringStatus: number;

  @attr('number')
  declare skOrganization: number;

  @attr('date')
  declare approvedOn: Date;

  @attr('date')
  declare addedOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare rejectedOn: Date;

  @attr('number', { allowNull: true })
  declare coreProject: number | null;

  @belongsTo('sk-app-metadata', { async: false, inverse: null })
  declare appMetadata: AsyncBelongsTo<SkAppMetadataModel>;

  @attr()
  declare availability: AvailabilityData;

  @attr()
  declare statusButtonsLoading: AvailabilityData;

  @attr('boolean')
  declare selected: boolean;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare addedBy: AsyncBelongsTo<OrganizationUserModel>;

  @attr('string')
  declare approvedBy: string;

  @attr('string')
  declare rejectedBy: string;

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
    return this.appMetadata.get('platform') === ENUMS.PLATFORM.IOS;
  }

  get foundBy() {
    if (this.appSource === 1) {
      return 'Manual Discovery';
    } else {
      return 'Auto Discovery';
    }
  }

  get status() {
    switch (this.approvalStatus) {
      case SkAppStatus.PENDING_APPROVAL:
        return 'pending';

      case SkAppStatus.APPROVED:
        return 'approved';

      case SkAppStatus.REJECTED:
        return 'rejected';

      default:
        return null;
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-requested-app': SkRequestedAppModel;
  }
}
