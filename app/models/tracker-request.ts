import Model, { attr } from '@ember-data/model';

export default class TrackerRequestModel extends Model {
  @attr('number')
  declare status: number;

  @attr('number')
  declare errorCode: number;

  @attr('string')
  declare errorMessage: string;

  @attr('string')
  declare privacyServiceRequestId: string;

  @attr('date')
  declare createdAt: Date;

  @attr('date')
  declare updatedAt: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'tracker-request': TrackerRequestModel;
  }
}
