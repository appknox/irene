import Model, { attr } from '@ember-data/model';

export default class PiiRequestModel extends Model {
  @attr('number')
  declare status: number;

  @attr('date')
  declare createdAt: Date;

  @attr('date')
  declare updatedAt: Date;

  @attr('boolean')
  declare settingsOutdated: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'pii-request': PiiRequestModel;
  }
}
