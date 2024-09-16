import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import OrganizationUserModel from './organization-user';

export interface AppMetadata {
  doc_ulid: string;
  doc_hash: string;
  app_id: string;
  url: string;
  icon_url: string;
  package_name: string;
  title: string;
  region: Region;
  store: Store;
  platform: number;
  platform_display: string;
  dev_name: string;
  dev_email: string;
  dev_website: string;
  dev_id: string;
  rating: number;
  rating_count: number;
  review_count: number;
  total_downloads: number;
  upload_date: Date;
  latest_upload_date: Date;
}

export interface Region {
  id: number;
  sk_store: number;
  country_code: string;
  icon: string;
}

export interface Store {
  id: number;
  name: string;
  identifier: string;
  icon: string;
  platform: number;
  platform_display: string;
}

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

  @attr()
  declare appMetadata: AppMetadata;

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
    return this.appMetadata.doc_ulid;
  }

  get iconUrl() {
    return this.appMetadata.icon_url;
  }

  get packageName() {
    return this.appMetadata.package_name;
  }

  get appUrl() {
    return this.appMetadata.url;
  }

  get title() {
    return this.appMetadata.title;
  }

  get devName() {
    return this.appMetadata.dev_name;
  }

  get devEmail() {
    return this.appMetadata.dev_email;
  }

  get isAndroid() {
    return this.appMetadata.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.appMetadata.platform === ENUMS.PLATFORM.IOS;
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
