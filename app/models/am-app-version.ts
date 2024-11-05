import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import AmAppModel from './am-app';
import FileModel from './file';
import SubmissionModel from './submission';

export default class AmAppVersionModel extends Model {
  @attr('string')
  declare createdOn: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare versionCode: string;

  @attr('string')
  declare comparableVersion: string;

  @attr('string')
  declare displayVersion: string;

  @attr('string')
  declare appName: string;

  @belongsTo('am-app', { async: true, inverse: null })
  declare amApp: AsyncBelongsTo<AmAppModel>;

  @belongsTo('submission', { async: true, inverse: null })
  declare uploadSubmission: AsyncBelongsTo<SubmissionModel>;

  @belongsTo('file', { async: true, inverse: null })
  declare latestFile: AsyncBelongsTo<FileModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'am-app-version': AmAppVersionModel;
  }
}
