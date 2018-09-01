import DS from 'ember-data';

export default DS.Model.extend({
  email: DS.attr('string'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  organization: DS.belongsTo('organization'),
});
