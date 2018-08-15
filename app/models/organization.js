import DS from 'ember-data';

const Organization = DS.Model.extend({
  name: DS.attr('string'),
  logo: DS.attr('string'),
  members: DS.hasMany('organization-user')
});

export default Organization;
