import DS from 'ember-data';

export default DS.Model.extend({
  member: DS.belongsTo('user' ),
  username: DS.attr('string'),
  email: DS.attr('string'),
  role: DS.attr('number'),
  roleDisplay: DS.attr('string'),
  isAdmin: DS.attr('boolean'),
  createdOn: DS.attr('date'),
});
