import Model, { attr } from '@ember-data/model';

export default class UploadAppModel extends Model {
  @attr('string')
  declare url: string;

  @attr('string')
  declare fileKey: string;

  @attr('string')
  declare fileKeySigned: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'upload-app': UploadAppModel;
  }
}
