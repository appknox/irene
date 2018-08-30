import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';


export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),

  targetObject: 'organization-invitation',
  sortProperties: ['createdOn:desc'],
  extraQueryStrings: Ember.computed(function() {
    const query = {
      'is_accepted': false
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newInvitationsObserver: Ember.observer("realtime.InvitationCounter", function() {
    return this.incrementProperty("version");
  })
});
