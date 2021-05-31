import Model, { attr, belongsTo }  from '@ember-data/model';

export default Model.extend({
  email: attr('string'),
  createdOn: attr('date'),
  updatedOn: attr('date'),
  organization: belongsTo('organization'),
});
