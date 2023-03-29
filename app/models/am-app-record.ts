import Model, { AsyncBelongsTo, belongsTo } from '@ember-data/model';
import AmAppVersionModel from './am-app-version';
import AmAppSyncModel from './am-app-sync';
import AmAppStoreInstanceModel from './am-app-store-instance';

export default class AmAppRecordModel extends Model {
  @belongsTo('am-app-version', { inverse: null })
  declare amAppVersion: AsyncBelongsTo<AmAppVersionModel>;

  @belongsTo('am-app-sync', { inverse: null })
  declare amAppSync: AsyncBelongsTo<AmAppSyncModel>;

  @belongsTo('am-app-store-instance', { inverse: null })
  declare amAppStoreInstance: AsyncBelongsTo<AmAppStoreInstanceModel>;
}
