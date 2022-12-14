/* eslint-disable ember/no-actions-hash, ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-observers, prettier/prettier */
import PaginateMixin from 'irene/mixins/paginate';

import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import Component from '@ember/component';

export default Component.extend(PaginateMixin, {
  me: service(),
  intl: service(),
  org: service('organization'),

  targetModel: 'organization-team',
  sortProperties: ['createdOn:desc'],
  showTeamDetails: false,
  selectedTeam: null,

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
