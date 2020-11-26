import PaginateMixin from 'irene/mixins/paginate';
import {
  t
} from 'ember-intl';
import {
  task
} from 'ember-concurrency';
import {
  on
} from '@ember/object/evented';
import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import {
  observer
} from '@ember/object';
import {
  debounce
} from '@ember/runloop';

export default Component.extend(PaginateMixin, {
  intl: service(),
  realtime: service(),
  notify: service('notifications'),

  query: '',
  searchQuery: '',
  isAddingProject: false,
  showAddTeamProjectModal: false,

  tTeamProjectAdded: t('teamProjectAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetModel: 'organization-project',
  sortProperties: ['created:desc'],
  extraQueryStrings: computed('team.id', 'searchQuery', function () {
    const query = {
      q: this.get('searchQuery'),
      exclude_team: this.get('team.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationNonTeamProjectsObserver: observer('realtime.OrganizationNonTeamProjectCounter', function () {
    return this.incrementProperty('version');
  }),


  /* Open add-team-project modal */
  openAddProjectModal: task(function* () {
    yield this.set('showAddTeamProjectModal', true);
  }),


  /* Add project to team */
  addTeamProject: task(function* (project) {
    this.set('isAddingProject', true);
    const data = {
      write: false
    };
    const team = this.get('team');
    yield team.addProject(data, project.id);

    this.get('realtime').incrementProperty('TeamProjectCounter');
    this.get('sortedObjects').removeObject(project);
  }).evented(),

  addTeamProjectSucceeded: on('addTeamProject:succeeded', function () {
    this.get('notify').success(this.get('tTeamProjectAdded'));

    this.set('isAddingProject', false);
    this.set('query', '');
  }),

  addTeamProjectErrored: on('addTeamProject:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }

    this.get('notify').error(errMsg);

    this.set('isAddingProject', false);
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
