import { belongsTo, Model } from 'ember-cli-mirage';

export default Model.extend({
  amApp: belongsTo('am-app'),
  latestFile: belongsTo('file', { inverse: null }),
});
