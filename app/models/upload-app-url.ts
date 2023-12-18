import Model, { attr } from '@ember-data/model';

export type UploadAppUrlModelName = 'upload-app-url';

export default class UploadAppUrlModel extends Model {
  @attr('string')
  declare url: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'upload-app-url': UploadAppUrlModel;
  }
}
