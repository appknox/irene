import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  owner: belongsTo('user'),
  lastFile: belongsTo('file', { inverse: null }),
  files: hasMany('file'),
});
