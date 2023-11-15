import Model, { attr } from '@ember-data/model';

export default class SecurityAttachmentModel extends Model {
  @attr('string') declare user: string;
  @attr('string') declare name: string;
  @attr('date') declare createdOn: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/attachment': SecurityAttachmentModel;
  }
}
