import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import AmAppModel from './am-app';

export default class AmAppSyncModel extends Model {
  @belongsTo('am-app')
  declare amApp: AsyncBelongsTo<AmAppModel>;

  @attr('date')
  declare syncedOn: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'am-app-sync': AmAppSyncModel;
  }
}
