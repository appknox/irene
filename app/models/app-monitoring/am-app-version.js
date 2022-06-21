import Model, { attr, belongsTo } from '@ember-data/model';

export default class AppMonitoringAmAppVersionModel extends Model {
  @attr('string') created_on;
  @attr('string') version;
  @attr('string') versionCode;

  @belongsTo('app-monitoring/am-app') am_app;
  @belongsTo('file') latest_file;
}
