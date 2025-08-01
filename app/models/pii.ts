import Model, { attr } from '@ember-data/model';

export interface PiiMetaData {
  value: string;
  source: string;
  url: string;
}

export default class PiiModel extends Model {
  @attr('string')
  declare sources: string;

  @attr('string')
  declare type: string;

  @attr()
  declare piiData: PiiMetaData[];

  @attr('boolean')
  declare highlight: boolean;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    pii: PiiModel;
  }
}
