import Model, { attr, belongsTo } from '@ember-data/model';

export default class AmAppSyncModel extends Model {
  @belongsTo('am-app') amApp;
  @attr('date') syncedOn;
}
