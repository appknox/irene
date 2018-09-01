import DS from 'ember-data';
import Ember from 'ember';

const Organization = DS.Model.extend({
  name: DS.attr('string'),
  logo: DS.attr('string'),
  members: DS.hasMany('organization-member'),
  namespaces: DS.hasMany('organization-namespace'),
  projects: DS.hasMany('organization-project'),
  teams: DS.hasMany('organization-team'),
  projectsCount: DS.attr('number'),
  namespacesCount: DS.attr('number'),
  teamsCount: DS.attr('number'),
  membersCount: Ember.computed('members', function() {
    return this.get('members.meta.count');
  }),
});

export default Organization;
