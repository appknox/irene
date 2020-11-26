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
