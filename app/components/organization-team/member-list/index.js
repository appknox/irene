/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/no-observers */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  intl: service(),
  me: service(),

  classNames: [''],
  targetModel: 'organization-team-member',
  sortProperties: ['created:desc'],
  searchQuery: '',

  columns: computed('intl', 'me.org.is_admin', function () {
    return [
      {
        name: this.get('intl').t('user'),
        valuePath: 'user.username',
        minWidth: 150,
      },
      {
        name: this.get('intl').t('email'),
        valuePath: 'user.email',
        minWidth: 150,
      },
      this.get('me.org.is_admin')
        ? {
            name: this.get('intl').t('action'),
            component: 'organization-team/member-list/user-action',
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

  newOrganizationTeamMembersObserver: observer(
    'realtime.TeamMemberCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),

  showAddMemberList: task(function* () {
    const handleAction = yield this.get('handleActiveAction');

    handleAction({ component: 'organization-team/add-team-member' });
  }),

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.set('searchQuery', query);
  },

  handleSearchQueryChange: task(function* (event) {
    yield debounce(this, this.get('setSearchQuery'), event.target.value, 500);
  }),
});
