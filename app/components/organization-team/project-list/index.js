/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/no-observers */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { capitalize } from '@ember/string';
import PaginateMixin from 'irene/mixins/paginate';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';

export default Component.extend(PaginateMixin, {
  intl: service(),
  me: service(),

  classNames: [''],
  targetModel: 'organization-team-project',
  sortProperties: ['created:desc'],
  searchQuery: '',

  columns: computed('intl', 'me.org.is_admin', function () {
    return [
      {
        name: capitalize(this.get('intl').t('project')),
        component: 'organization-team/project-list/project-info',
        minWidth: 150,
      },
      this.get('me.org.is_admin')
        ? {
            name: this.get('intl').t('accessPermissions'),
            component: 'organization-team/project-list/access-permission',
          }
        : null,
      this.get('me.org.is_admin')
        ? {
            name: this.get('intl').t('action'),
            component: 'organization-team/project-list/project-action',
            textAlign: 'center',
          }
        : null,
    ].filter(Boolean);
  }),

  extraQueryStrings: computed('team.id', 'searchQuery', function () {
    const query = {
      teamId: this.get('team.id'),
      q: this.get('searchQuery'),
    };

    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationTeamProjectsObserver: observer(
    'realtime.TeamProjectCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),

  showAddProjectList: task(function* () {
    const handleAction = yield this.get('handleActiveAction');

    handleAction({ component: 'organization-team/add-team-project' });
  }),

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.set('searchQuery', query);
  },

  handleSearchQueryChange: task(function* (event) {
    yield debounce(this, this.get('setSearchQuery'), event.target.value, 500);
  }),
});
