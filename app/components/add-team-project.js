import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),

  query: '',
  isAddingProject: false,
  showAddTeamProjectModal: false,

  tTeamProjectAdded: t('teamProjectAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetObject: 'organization-project',
  sortProperties: ['created:desc'],
  extraQueryStrings: Ember.computed('team.id', function() {
    const query = {
      exclude_team: this.get('team.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationNonTeamProjectsObserver: Ember.observer("realtime.OrganizationNonTeamProjectCounter", function() {
    return this.incrementProperty("version");
  }),


  /* Fetch organization-projects which are not included in team */
  orgNonTeamProjects: Ember.computed(function() {
    return this.get('store').query('organization-project', {exclude_team: this.get('team.id')});
  }).property(),


  /* Open add-team-project modal */
  openAddProjectModal: task(function * () {
    yield this.set('showAddTeamProjectModal', true);
  }),


  /* Add project to team */
  addTeamProject: task(function * (project) {
    this.set('isAddingProject', true);
    const data = {
      write: false
    };
    const team = this.get('team');
    yield team.addProject(data, project.id);

    this.get('realtime').incrementProperty('TeamProjectCounter');
    this.get('sortedObjects').removeObject(project);
  }).evented(),

  addTeamProjectSucceeded: on('addTeamProject:succeeded', function() {
    this.get('notify').success(this.get("tTeamProjectAdded"));

    this.set('isAddingProject', false);
    this.set('query', '');
  }),

  addTeamProjectErrored: on('addTeamProject:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set('isAddingProject', false);
    this.set('query', '');
  }),

  // /* Search member */
  // searchProject() {
  //   const searchText = this.get("query");
  //   const that = this;

  //   this.set("isSearchingProject", true);

  //   return this.get('store').query('organization-project', {
  //     q: searchText,
  //     exclude_team: this.get('team.id')
  //   })
  //     .then(function(response) {
  //       if(!that.isDestroyed) {
  //         that.set("isSearchingProject", false);
  //       }
  //       that.set("sortedObjects", response);
  //     })
  //     .catch(function() {
  //       that.set("isSearchingProject", false);
  //     });
  // },

  // actions: {
  //   searchQuery() {
  //     Ember.run.debounce(this, this.searchProject, 500);
  //   },
  // }

});
