import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  organization: belongsTo('organization'),
  members: hasMany('sk-organization-membership'),
});
