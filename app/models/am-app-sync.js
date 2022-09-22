import Model, { attr, belongsTo } from '@ember-data/model';

export default class AmAppSync extends Model {
  @belongsTo('am-app') amApp;
  @attr('date') syncedOn;
}
