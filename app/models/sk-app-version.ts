import Model, {
  AsyncBelongsTo,
  attr,
  belongsTo,
  hasMany,
  SyncHasMany,
} from '@ember-data/model';

import type SkInventoryAppModel from './sk-inventory-app';
import type FileModel from './file';
import type SkStoreInstanceModel from './sk-store-instance';
import type SubmissionModel from './submission';

export default class SkAppVersionModel extends Model {
  @attr('string')
  declare version: string;

  @attr('string')
  declare versionCode: string;

  @attr('boolean')
  declare isLatest: boolean;

  @attr('boolean')
  declare canInitiateUpload: boolean;

  @attr('number')
  declare appScanStatus: number;

  @attr('string')
  declare appScanStatusDisplay: string;

  @attr('string')
  declare submissionErrorHeader: string;

  @attr('string')
  declare submissionErrorMessage: string;

  @attr('date')
  declare createdOn: Date;

  @belongsTo('submission', { async: true, inverse: null })
  declare uploadSubmission: AsyncBelongsTo<SubmissionModel> | null;

  @belongsTo('sk-inventory-app', { async: true, inverse: null })
  declare skApp: AsyncBelongsTo<SkInventoryAppModel>;

  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;

  @hasMany('sk-store-instance', { async: false, inverse: null })
  declare skStoreInstances: SyncHasMany<SkStoreInstanceModel>;

  async iniiateAppUpload() {
    const adapter = this.store.adapterFor('sk-app-version');

    return await adapter.iniiateAppUpload(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-app-version': SkAppVersionModel;
  }
}
