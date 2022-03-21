/* eslint-disable ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-observers, prettier/prettier */
import PaginateMixin from 'irene/mixins/paginate';

import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import Component from '@ember/component';

export default Component.extend(PaginateMixin, {
  me: service(),
  intl: service(),
  org: service('organization'),

  targetModel: 'organization-team',
  sortProperties: ['createdOn:desc'],

  newInvitationsObserver: observer("realtime.OrganizationTeamCounter", function() {
    return this.incrementProperty("version");
  }),
});
