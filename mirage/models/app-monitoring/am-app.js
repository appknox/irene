import { belongsTo, hasMany, Model } from 'ember-cli-mirage';

export default Model.extend({
  am_configuration: belongsTo('amconfiguration'),
  project: belongsTo('project'),
  latest_am_app_version: belongsTo('app-monitoring/am-app-version'),
  am_app_syncs: hasMany('app-monitoring/am-app-sync'),
});
