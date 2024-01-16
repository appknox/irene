import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  owner: belongsTo('user'),
  users: hasMany('user'),
});
