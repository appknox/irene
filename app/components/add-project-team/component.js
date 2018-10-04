import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),
  notify: Ember.inject.service(),

  query: '',
  searchQuery: '',
  isAddingTeam: false,
  showAddProjectTeamModal: false,

  tProjectTeamAdded: t('projectTeamAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetObject: 'organization-team',
  sortProperties: ['created:desc'],
  extraQueryStrings: Ember.computed('team.id', 'searchQuery', function() {
    const query = {
      q: this.get('searchQuery'),
      exclude_project: this.get('project.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newProjectNonTeamCountersObserver: Ember.observer('realtime.ProjectNonTeamCounter', function() {
    return this.incrementProperty('version');
  }),


  /* Open add-project-team modal */
  openAddTeamModal: task(function * () {
    yield this.set('showAddProjectTeamModal', true);
  }),


  /* Add team to project */
  addProjectTeam: task(function * (project, team) {
    this.set('isAddingTeam', true);
    const data = {
      write: false
    };
    yield team.addProject(data, project.id);

    this.get('realtime').incrementProperty('ProjectTeamCounter');
    this.get('sortedObjects').removeObject(team);
  }).evented(),

  addProjectTeamSucceeded: on('addProjectTeam:succeeded', function() {
    this.get('notify').success(this.get('tProjectTeamAdded'));

    this.set('isAddingTeam', false);
    this.set('query', '');
  }),

  addProjectTeamErrored: on('addProjectTeam:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get('notify').error(errMsg);

    this.set('isAddingTeam', false);
    this.set('query', '');
  }),

  /* Set debounced searchQuery */
  setSearchQuery() {
    this.set('searchQuery', this.get('query'));
  },

  actions: {
    searchQuery() {
      Ember.run.debounce(this, this.setSearchQuery, 500);
    },
  }

});
