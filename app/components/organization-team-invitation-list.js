import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';


export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),

  targetObject: 'organization-team-invitation',
  sortProperties: ['createdOn:desc'],

  extraQueryStrings: Ember.computed('team.id', function() {
    const query = {
      teamId: this.get('team.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newInvitationsObserver: Ember.observer("realtime.InvitationCounter", function() {
    return this.incrementProperty("version");
  })
});
