import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  members: DS.hasMany('organization-member'),
  organization: DS.attr('string'),
  createdOn: DS.attr('date'),
  membersCount: DS.attr('number'),
  projectsCount: DS.attr('number'),
});
