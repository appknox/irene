import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';


export default Component.extend(PaginateMixin, {
  intl: service(),

  targetModel: 'organization-invitation',
  sortProperties: ['createdOn:desc'],
  extraQueryStrings: computed(function() {
    const query = {
      'is_accepted': false
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newInvitationsObserver: observer("realtime.InvitationCounter", function() {
    return this.incrementProperty("version");
  })
});
