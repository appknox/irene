import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

export default class PartnerclientModel extends Model {
  @attr('date')
  declare lastUploadedOn: Date;

  @attr('string')
  declare logo: string;

  @attr('string')
  declare name: string;

  @attr()
  declare ownerEmails: string[];

  @attr('date')
  declare createdOn: Date;

  get isEmptyTitle() {
    return isEmpty(this.name);
  }

  get company() {
    return this.name;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient': PartnerclientModel;
  }
}
