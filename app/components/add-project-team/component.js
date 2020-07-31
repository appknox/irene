import PaginateMixin from 'irene/mixins/paginate';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import { debounce } from '@ember/runloop';

export default Component.extend(PaginateMixin, {
  intl: service(),
  realtime: service(),
  notify: service('notification-messages-service'),

  query: '',
  searchQuery: '',
  isAddingTeam: false,
  showAddProjectTeamModal: false,

  tProjectTeamAdded: t('projectTeamAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetModel: 'organization-team',
  sortProperties: ['created:desc'],
  extraQueryStrings: computed('project.id', 'searchQuery', 'team.id', function () {
    const query = {
      q: this.get('searchQuery'),
      exclude_project: this.get('project.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newProjectNonTeamCountersObserver: observer('realtime.ProjectNonTeamCounter', function () {
    return this.incrementProperty('version');
  }),


  /* Open add-project-team modal */
  openAddTeamModal: task(function* () {
    yield this.set('showAddProjectTeamModal', true);
  }),


  /* Add team to project */
  addProjectTeam: task(function* (project, team) {
    this.set('isAddingTeam', true);
    const data = {
      write: false
    };
    yield team.addProject(data, project.id);

    this.get('realtime').incrementProperty('ProjectTeamCounter');
    this.get('sortedObjects').removeObject(team);
  }).evented(),

  addProjectTeamSucceeded: on('addProjectTeam:succeeded', function () {
    this.get('notify').success(this.get('tProjectTeamAdded'));

    this.set('isAddingTeam', false);
    this.set('query', '');
  }),

  addProjectTeamErrored: on('addProjectTeam:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
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
      debounce(this, this.setSearchQuery, 500);
    },
  }

});
