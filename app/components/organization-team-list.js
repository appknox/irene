import PaginateMixin from 'irene/mixins/paginate';

import { inject as service } from '@ember/service';
import { observer, computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend(PaginateMixin, {
  me: service(),
  i18n: service(),
  org: service('organization'),

  targetObject: 'organization-team',
  sortProperties: ['createdOn:desc'],

  newInvitationsObserver: observer("realtime.OrganizationTeamCounter", function() {
    return this.incrementProperty("version");
  }),

  hasMember: computed.gt('org.selected.membersCount', 0)

});
