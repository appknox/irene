import Model, { belongsTo } from '@ember-data/model';

export default class AppMonitoringAmAppSyncModel extends Model {
  @belongsTo('app-monitoring/am_app') am_app;
}
