/* eslint-disable ember/no-classic-components, ember/no-mixins, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-observers */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

/**
 * This Component is used in organization-team-invitation too
 * params overriding -> extraQueryStrings, columns & targetModel
 */
export default Component.extend(PaginateMixin, {
  intl: service(),

  targetModel: 'organization-invitation',
  sortProperties: ['createdOn:desc'],

  extraQueryStrings: computed(function () {
    const query = {
      is_accepted: false,
    };

    return JSON.stringify(query, Object.keys(query).sort());
  }),

  columns: computed('intl', 'customColumns', function () {
    return [
      {
        name: this.intl.t('email'),
        valuePath: 'email',
        minWidth: 150,
      },
      {
        name: this.intl.t('inviteType'),
        component: 'organization-invitation-list/invite-type',
      },
      {
        name: this.intl.t('invitedOn'),
        component: 'organization-invitation-list/invited-on',
      },
      {
        name: this.intl.t('resend'),
        component: 'organization-invitation-list/invite-resend',
        textAlign: 'center',
      },
      {
        name: this.intl.t('delete'),
        component: 'organization-invitation-list/invite-delete',
        textAlign: 'center',
      },
    ];
  }),

  newInvitationsObserver: observer('realtime.InvitationCounter', function () {
    return this.incrementProperty('version');
  }),
});
