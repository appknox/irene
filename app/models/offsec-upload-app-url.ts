import Model, { attr } from '@ember-data/model';

export type OffsecUploadAppUrlModelName = 'offsec-upload-app-url';

export default class OffsecUploadAppUrlModel extends Model {
  @attr('string')
  declare url: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'offsec-upload-app-url': OffsecUploadAppUrlModel;
  }
}
