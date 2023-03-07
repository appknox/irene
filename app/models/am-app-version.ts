import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import AmAppModel from './am-app';
import FileModel from './file';

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

  @belongsTo('am-app')
  declare amApp?: AsyncBelongsTo<AmAppModel>;

  @belongsTo('file', { inverse: null })
  declare latestFile: AsyncBelongsTo<FileModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'am-app-version': AmAppVersionModel;
  }
}
