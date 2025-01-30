import Model, { attr } from '@ember-data/model';

export enum TrackerStatus {
  STARTED = 0,
  PENDING = 1,
  SUCCESS = 2,
  FAILED = 3,
}

export default class TrackerRequestModel extends Model {
  @attr('number')
  declare status: TrackerStatus;

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
