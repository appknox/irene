/* eslint-disable ember/no-classic-components, ember/no-mixins, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-get, ember/no-observers */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  intl: service(),
  me: service(),

  targetModel: 'organization-team-invitation',
  sortProperties: ['createdOn:desc'],

  extraQueryStrings: computed('team.id', function () {
    const query = {
      teamId: this.get('team.id'),
      is_accepted: false,
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newInvitationsObserver: observer('realtime.InvitationCounter', function () {
    return this.incrementProperty('version');
  }),
});
