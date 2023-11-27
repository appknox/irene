import Model, { attr } from '@ember-data/model';
import { htmlSafe } from '@ember/template';

export default class PartnerclientProjectFileModel extends Model {
  @attr('string')
  declare name: string;

  @attr('date')
  declare createdOn: Date;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare versionCode: string;

  get backgroundIconStyle() {
    return htmlSafe(`background-image: url(${this.iconUrl})`);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-project-file': PartnerclientProjectFileModel;
  }
}
