import Model, { attr } from '@ember-data/model';

export interface Request {
  host: string;
  scheme: string;
  path: string;
  method: string;
  port: string;
}

export default class CapturedApiModel extends Model {
  @attr('boolean')
  declare isActive: boolean;

  @attr
  declare request: Request;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    capturedapi: CapturedApiModel;
  }
}
