import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  me: Ember.inject.service(),

  classNames: [''],
  targetObject: 'project-team',
  sortProperties: ['created:desc'],
  extraQueryStrings: Ember.computed('project.id', function() {
    const query = {
      projectId: this.get('project.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newProjectTeamsObserver: Ember.observer('realtime.ProjectTeamCounter', function() {
    return this.incrementProperty('version');
  }),
});
