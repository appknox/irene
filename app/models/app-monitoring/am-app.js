import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import ENUMS from 'irene/enums';

export default class AppMonitoringAmAppModel extends Model {
  @attr('boolean') automated_upload;
  @attr('boolean') monitoring_enabled;
  @attr('string') ulid;

  @belongsTo('amconfiguration') am_configuration;
  @belongsTo('project') project;
  @belongsTo('app-monitoring/am-app-version') latest_am_app_version;
  @hasMany('app-monitoring/am-app-sync') am_app_syncs;

  get platform() {
    switch (this.project?.get('platform')) {
      case ENUMS.PLATFORM.ANDROID:
        return 'android';
      case ENUMS.PLATFORM.IOS:
        return 'apple';
      case ENUMS.PLATFORM.WINDOWS:
        return 'windows';
      default:
        return '';
    }
  }
}
