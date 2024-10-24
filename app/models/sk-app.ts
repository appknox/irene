import Model, { attr } from '@ember-data/model';

export interface SkAppMetadata {
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

export interface SkAppAvailabilityData {
  storeknox: boolean;
  appknox: boolean;
}

export default class SkAppModel extends Model {
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

  @attr('number')
  declare addedBy: number;

  @attr('date')
  declare addedOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('number', { allowNull: true })
  declare coreProject: number | null;

  @attr('number')
  declare approvedBy: number;

  @attr()
  declare appMetadata: Partial<SkAppMetadata>;

  @attr()
  declare availability: Partial<SkAppAvailabilityData>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-app': SkAppModel;
  }
}
