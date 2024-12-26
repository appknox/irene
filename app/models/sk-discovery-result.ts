import Model, { attr } from '@ember-data/model';

import ENUMS from 'irene/enums';

export default class SkDiscoverySearchResultModel extends Model {
  @attr('string')
  declare docUlid: string;

  @attr('string')
  declare docHash: string;

  @attr('string')
  declare appId: string;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare title: string;

  @attr('number')
  declare platform: number;

  @attr('string')
  declare region: string;

  @attr('number')
  declare appSize: number;

  @attr('string')
  declare appType: string;

  @attr('string')
  declare appUrl: string;

  @attr('boolean')
  declare isFree: boolean;

  @attr('string')
  declare description: string;

  @attr('string')
  declare devEmail: string;

  @attr('string')
  declare devName: string;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare latestUploadDate: string;

  @attr('string')
  declare minOsRequired: string;

  @attr('number')
  declare rating: number;

  @attr('number')
  declare ratingCount: number;

  @attr()
  declare screenshots: string[];

  @attr('string')
  declare version: string;

  @attr('string')
  declare docCreatedOn: string;

  @attr('string')
  declare docUpdatedOn: string;

  get isAndroid() {
    return this.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.platform === ENUMS.PLATFORM.IOS;
  }

  async checkApprovalStatus(ulid: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.checkApprovalStatus(ulid);
  }

  async addAppToInventory(ulid: string, searchId: string | number) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.addAppToInventory(ulid, searchId);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-discovery-result': SkDiscoverySearchResultModel;
  }
}
