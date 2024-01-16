import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  organization: belongsTo('organization'),
});
