import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type OrganizationUserModel from './organization-user';
import type SkAppMetadataModel from './sk-app-metadata';

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
  declare appMetadata: SkAppMetadataModel;

  @attr()
  declare availability: AvailabilityData;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare addedBy: AsyncBelongsTo<OrganizationUserModel>;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare approvedBy: AsyncBelongsTo<OrganizationUserModel> | string;

  @belongsTo('organization-user', { async: true, inverse: null })
  declare rejectedBy: AsyncBelongsTo<OrganizationUserModel> | string;

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

  async approveApp(id: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.approveApp(id);
  }

  async rejectApp(id: string) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.rejectApp(id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-app': SkAppModel;
  }
}
