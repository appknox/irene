import { belongsTo, Model } from 'ember-cli-mirage';

export default Model.extend({
  amConfiguration: belongsTo('amconfiguration'),
  project: belongsTo('project'),
  latestAmAppVersion: belongsTo('am-app-version', { inverse: null }),
  lastSync: belongsTo('am-app-sync', { inverse: null }),
});
