import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  me: Ember.inject.service(),

  classNames: [''],
  targetObject: 'organization-team-project',
  sortProperties: ['created:desc'],
  extraQueryStrings: Ember.computed('team.id', function() {
    const query = {
      teamId: this.get('team.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationTeamProjectsObserver: Ember.observer("realtime.TeamProjectCounter", function() {
    return this.incrementProperty("version");
  }),
});
