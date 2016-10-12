import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  project: belongsTo('project'),
  analyses: hasMany('analysis')
});
