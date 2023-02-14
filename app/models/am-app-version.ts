import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import ENUMS from 'irene/enums';

import AmAppModel from './am-app';
import FileModel from './file';

export default class AmAppVersionModel extends Model {
  @attr('string')
  declare createdOn: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare versionCode: string;

  @belongsTo('am-app')
  declare amApp?: AsyncBelongsTo<AmAppModel>;

  @belongsTo('file', { inverse: null })
  declare latestFile: AsyncBelongsTo<FileModel>;

  get comparableVersion() {
    const platform = this.amApp?.get('project')?.get('platform');

    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }

    return this.versionCode;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'am-app-version': AmAppVersionModel;
  }
}
