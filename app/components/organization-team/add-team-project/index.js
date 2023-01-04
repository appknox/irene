/* eslint-disable ember/no-array-prototype-extensions, ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-get, prettier/prettier, ember/no-observers, ember/no-actions-hash */
import PaginateMixin from 'irene/mixins/paginate';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import { debounce } from '@ember/runloop';

export default Component.extend(PaginateMixin, {
  intl: service(),
  realtime: service(),
  notify: service('notifications'),

  query: '',
  searchQuery: '',
  isAddingProject: false,
  addProjectErrorCount: 0,

  tTeamProjectAdded: t('teamProjectAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetModel: 'organization-project',
  sortProperties: Object.freeze(['created:desc']),

  init(...args) {
    this._super(...args);
    this.set('selectedProjects', {});
  },

  columns: computed('intl', function () {
    return [
      {
        name: this.get('intl').t('name'),
        component: 'organization-team/add-team-project/project-info',
        minWidth: 250,
      },
      {
        name: this.get('intl').t('action'),
        component: 'ak-checkbox',
        textAlign: 'center',
      },
    ];
  }),

  modifiedSortedObjects: computed(
    'sortedObjects',
    'selectedProjects',
    function () {
      return this.get('sortedObjects').map((so) => {
        if (this.get('selectedProjects')[so.id]) {
          so.set('checked', true);
        }

        return so;
      });
    }
  ),

  extraQueryStrings: computed('team.id', 'searchQuery', function () {
    const query = {
      q: this.get('searchQuery'),
      exclude_team: this.get('team.id'),
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationNonTeamProjectsObserver: observer(
    'realtime.OrganizationNonTeamProjectCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),

  selectionChange: task(function* (project, event) {
    const selectedProjects = yield this.get('selectedProjects');

    if (event.target.checked) {
      selectedProjects[project.id] = project;
    } else {
      delete selectedProjects[project.id];
    }

    this.set('selectedProjects', { ...selectedProjects });
  }),

  hasNoSelection: computed('selectedProjects', function () {
    return Object.keys(this.get('selectedProjects')).length === 0;
  }),

  /* Add project to team */
  addTeamProject: task(function* (project) {
    try {
      const data = {
        write: false,
      };

      const team = this.get('team');
      yield team.addProject(data, project.id);

      this.get('realtime').incrementProperty('TeamProjectCounter');
      this.get('sortedObjects').removeObject(project);
    } catch (err) {
      let errMsg = this.get('tPleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.get('notify').error(errMsg);
      this.incrementProperty('addProjectErrorCount');
    }
  })
    .enqueue()
    .maxConcurrency(3),

  addSelectedTeamProjects: task(function* () {
    this.set('isAddingProject', true);

    const selectedProjects = Object.values(this.get('selectedProjects'));

    if (selectedProjects.length === 0) {
      return;
    }

    for (let i = 0; i < selectedProjects.length; i++) {
      yield this.get('addTeamProject').perform(selectedProjects[i]);
    }

    if (this.get('addProjectErrorCount') === 0) {
      this.get('notify').success(this.get('tTeamProjectAdded'));
      this.set('selectedProjects', {});
      this.set('query', '');
      this.set('searchQuery', '');
    }

    this.set('isAddingProject', false);
  }),

  /* Set debounced searchQuery */
  setSearchQuery() {
    this.set('searchQuery', this.get('query'));
  },

  handleSearchQueryChange: task(function* () {
    yield debounce(this, this.setSearchQuery, 500);
  }),
});
