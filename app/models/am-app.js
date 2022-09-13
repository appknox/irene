import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
export default class AmApp extends Model {
  @attr('boolean') automatedUpload;
  @attr('boolean') monitoringEnabled;
  @attr('boolean') isActive;

  @belongsTo('amconfiguration') amConfiguration;
  @belongsTo('project') project;
  @belongsTo('am-app-sync', { inverse: null }) lastSync;
  @belongsTo('am-app-version', { inverse: null }) latestAmAppVersion;

  @hasMany('am-app-sync') amAppSyncs;
  @hasMany('am-app-version') amAppVersions;

  get isPending() {
    return !this.lastSync.get('id');
  }

  get hasLatestAmAppVersion() {
    return !!this.latestAmAppVersion.get('id');
  }

  get isNotFound() {
    if (this.isPending) {
      return false;
    }
    return !this.hasLatestAmAppVersion || false;
  }
}
