import DS from 'ember-data';

export default DS.Model.extend({
  member: DS.belongsTo('organization-user'),
  role: DS.attr('number'),
  roleDisplay: DS.attr('string'),
  isAdmin: DS.attr('boolean'),
  createdOn: DS.attr('date'),
  teams: DS.hasMany('organization-team')
});
