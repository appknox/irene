import DS from 'ember-data';

export default DS.Model.extend({
  value: DS.attr('string'),
  createdOn: DS.attr('date'),
  approvedOn: DS.attr('date'),
  isApproved: DS.attr('boolean'),
  organization: DS.belongsTo('organization'),
});
