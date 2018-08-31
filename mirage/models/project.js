import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  owner: belongsTo('user'),
  files: hasMany('file'),
});
