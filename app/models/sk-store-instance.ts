import Model, { type AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import type SkStoreModel from './sk-store';

export default class SkStoreInstanceModel extends Model {
  @attr('string')
  declare icon: string;

  @attr('string')
  declare countryCode: string;

  @belongsTo('sk-store', { async: true, inverse: null })
  declare skStore: AsyncBelongsTo<SkStoreModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-store-instance': SkStoreInstanceModel;
  }
}
