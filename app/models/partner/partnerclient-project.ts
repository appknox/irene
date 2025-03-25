import Model, { attr } from '@ember-data/model';

export default class PartnerPartnerclientProjectModel extends Model {
  @attr('string')
  declare packageName: string;

  @attr('string')
  declare platform: string;

  @attr('date')
  declare createdOn: Date;

  get platformIcon(): 'apple' | 'android' {
    return this.platform === 'iOS' ? 'apple' : 'android';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-project': PartnerPartnerclientProjectModel;
  }
}
