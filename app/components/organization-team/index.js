/* eslint-disable ember/no-actions-hash, ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-observers, prettier/prettier */
import PaginateMixin from 'irene/mixins/paginate';
import { inject as service } from '@ember/service';
import { observer, computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import Component from '@ember/component';
import ENV from 'irene/config/environment';

export default Component.extend(PaginateMixin, {
  me: service(),
  intl: service(),
  org: service('organization'),

  targetModel: 'organization-team',
  sortProperties: ['createdOn:desc'],
  showTeamDetails: false,
  selectedTeam: null,
  searchQuery: '',

  extraQueryStrings: computed('searchQuery', function () {
    const query = {
      q: this.searchQuery,
    };

    return JSON.stringify(query, Object.keys(query).sort());
  }),

  /* Set debounced searchQuery */
  setSearchQuery(value) {
    this.set('searchQuery', value);

    if (value !== '') {
      this.set('limit', ENV.paginate.perPageLimit);
      this.set('offset', 0);
    }
  },

  handleSearchInputKeyUp: task(function* (event) {
    yield debounce(this, this.setSearchQuery, event.target.value, 500);
  }),

  handleShowTeamDetails: task(function* (team) {
    yield this.set('selectedTeam', team);
    yield this.set('showTeamDetails', true);
  }),

  handleTeamDetailClose: task(function* () {
    yield this.set('selectedTeam', null);
    yield this.set('showTeamDetails', false);
  }),

  newInvitationsObserver: observer(
    'realtime.OrganizationTeamCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),
});
