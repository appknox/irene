import Model, { attr } from '@ember-data/model';

export interface Standard {
  description: string;
  specifications: string;
  title: string;
}

export default class HipaaModel extends Model {
  @attr('string')
  declare code: string;

  @attr
  declare safeguard: string;

  @attr('string')
  declare title: string;

  @attr
  declare standards: Standard[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    hipaa: HipaaModel;
  }
}
