import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  approvedBy: belongsTo('organization-user'),
  requestedBy: belongsTo('organization-user'),
});
