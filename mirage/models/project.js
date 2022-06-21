import { belongsTo, hasMany, Model } from 'ember-cli-mirage';

export default Model.extend({
  owner: belongsTo('user'),
  lastFile: belongsTo('file', { inverse: 'file' }),
  files: hasMany('file'),
});
