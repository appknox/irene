/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr, belongsTo } from '@ember-data/model';
import { bool, not } from '@ember/object/computed';

export default class AmApp extends Model {
  @attr('boolean') automatedUpload;
  @attr('boolean') monitoringEnabled;

  @belongsTo('amconfiguration') amConfiguration;
  @belongsTo('project') project;
  @belongsTo('am-app-sync') lastSync;
  @belongsTo('am-app-version') latestAmAppVersion;

  @not('lastSync.id') isPending;
  @bool('latestAmAppVersion.id') hasLatestAmAppVersion;

  get isNotFound() {
    if (this.isPending) {
      return false;
    }

    return !this.hasLatestAmAppVersion || false;
  }
}
