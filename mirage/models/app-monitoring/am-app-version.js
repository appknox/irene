import { belongsTo, Model } from 'ember-cli-mirage';

export default Model.extend({
  am_app: belongsTo('app-monitoring/am-app'),
  latest_file: belongsTo('file'),
});
