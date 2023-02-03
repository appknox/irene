import Model, { attr } from '@ember-data/model';

export default class AttachmentModel extends Model {
  @attr('string')
  declare uuid: string;

  @attr('string')
  declare name: string;

  @attr('string')
  declare downloadUrl: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    attachment: AttachmentModel;
  }
}
