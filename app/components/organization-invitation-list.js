import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';


export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),

  targetObject: 'organization-invitation',
  sortProperties: ['createdOn:desc'],

  newInvitationsObserver: Ember.observer("realtime.InvitationCounter", function() {
    return this.incrementProperty("version");
  })
});
