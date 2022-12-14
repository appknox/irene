/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/no-observers */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  intl: service(),
  me: service(),

  classNames: [''],
  targetModel: 'organization-team-member',
  sortProperties: ['created:desc'],

  extraQueryStrings: computed('team.id', function () {
    const query = {
      teamId: this.get('team.id'),
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationTeamMembersObserver: observer(
    'realtime.TeamMemberCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),
});
