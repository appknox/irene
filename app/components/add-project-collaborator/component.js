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
  notify: service('notifications'),

  query: '',
  searchQuery: '',
  isAddingCollaborator: false,
  showAddProjectCollaboratorModal: false,

  tProjectCollaboratorAdded: t('projectCollaboratorAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetModel: 'organization-member',
  sortProperties: ['created:desc'],
  extraQueryStrings: computed('collaborator.id', 'project.id', 'searchQuery', function () {
    const query = {
      q: this.get('searchQuery'),
      exclude_project: this.get('project.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newProjectNonCollaboratorCountersObserver: observer('realtime.ProjectNonCollaboratorCounter', function () {
    return this.incrementProperty('version');
  }),


  /* Open add-project-collaborator modal */
  openAddCollaboratorModal: task(function* () {
    yield this.set('showAddProjectCollaboratorModal', true);
  }),


  /* Add collaborator to project */
  addProjectCollaborator: task(function* (member) {
    this.set('isAddingCollaborator', true);
    const prj = yield this.get('store').findRecord('organization-project', this.get('project.id'));
    const data = {
      write: false
    };
    yield prj.addCollaborator(data, member.id);

    this.get('realtime').incrementProperty('ProjectCollaboratorCounter');
    this.get('sortedObjects').removeObject(member);
  }).evented(),

  addProjectCollaboratorSucceeded: on('addProjectCollaborator:succeeded', function () {
    this.get('notify').success(this.get('tProjectCollaboratorAdded'));

    this.set('isAddingCollaborator', false);
    this.set('query', '');
  }),

  addProjectCollaboratorErrored: on('addProjectCollaborator:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }

    this.get('notify').error(errMsg);

    this.set('isAddingCollaborator', false);
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
