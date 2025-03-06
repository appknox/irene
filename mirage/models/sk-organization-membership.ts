import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  member: belongsTo('user'),
  skOrganization: belongsTo('sk-organization'),
});
