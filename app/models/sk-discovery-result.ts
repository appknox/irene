import Model, { attr } from '@ember-data/model';
import ENUMS from 'irene/enums';

export default class SkDiscoverySearchResultModel extends Model {
  @attr('string')
  declare doc_ulid: string;

  @attr('string')
  declare doc_hash: string;

  @attr('string')
  declare app_id: string;

  @attr('string')
  declare package_name: string;

  @attr('string')
  declare title: string;

  @attr('number')
  declare platform: number;

  @attr('string')
  declare region: string;

  @attr('number')
  declare app_size: number;

  @attr('string')
  declare app_type: string;

  @attr('string')
  declare app_url: string;

  @attr('boolean')
  declare is_free: boolean;

  @attr('string')
  declare description: string;

  @attr('string')
  declare dev_name: string;

  @attr('string')
  declare icon_url: string;

  @attr('string')
  declare latest_upload_date: string;

  @attr('string')
  declare min_os_required: string;

  @attr('number')
  declare rating: number;

  @attr('number')
  declare rating_count: number;

  @attr()
  declare screenshots: string[];

  @attr('string')
  declare version: string;

  @attr('string')
  declare doc_created_on: string;

  @attr('string')
  declare doc_updated_on: string;

  @attr('number')
  declare doc_updated_on_ts: number;

  get isAndroid() {
    return this.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.platform === ENUMS.PLATFORM.IOS;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-discovery-result': SkDiscoverySearchResultModel;
  }
}
