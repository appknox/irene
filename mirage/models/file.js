import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  project: belongsTo('project'),
  profile: belongsTo('profile'),
  analyses: hasMany('analysis'),
});
