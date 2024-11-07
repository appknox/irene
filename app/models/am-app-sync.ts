import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import AmAppModel from './am-app';

export default class AmAppSyncModel extends Model {
  @attr('date')
  declare syncedOn: Date;

  @belongsTo('am-app', { async: true, inverse: 'lastSync' })
  declare amApp: AsyncBelongsTo<AmAppModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'am-app-sync': AmAppSyncModel;
  }
}
