import DS from 'ember-data';

const Organization = DS.Model.extend({
  name: DS.attr('string'),
  logo: DS.attr('string'),
  members: DS.hasMany('organization-member')
});

export default Organization;
