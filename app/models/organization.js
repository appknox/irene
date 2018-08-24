import DS from 'ember-data';
import Ember from 'ember';

const Organization = DS.Model.extend({
  name: DS.attr('string'),
  logo: DS.attr('string'),
  members: DS.hasMany('organization-member'),
  namespaces: DS.hasMany('organization-namespace'),
  projects: DS.hasMany('organization-project'),
  teams: DS.hasMany('organization-team'),
  membersCount: Ember.computed('members', function() {
    return this.get('members.meta.count');
  }),
  namespacesCount: Ember.computed('namespaces', function() {
    return this.get('namespaces.meta.count');
  }),
  projectsCount: Ember.computed('projects', function() {
    return this.get('projects.meta.count');
  }),
  teamsCount: Ember.computed('teams', function() {
    return this.get('teams.meta.count');
  }),
});

export default Organization;
