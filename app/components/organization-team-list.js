import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

const {inject: {service}} = Ember;

export default Ember.Component.extend(PaginateMixin, {
  me: service(),
  i18n: service(),
  org: service('organization'),

  targetObject: 'organization-team',
  sortProperties: ['createdOn:desc'],

  newInvitationsObserver: Ember.observer("realtime.OrganizationTeamCounter", function() {
    return this.incrementProperty("version");
  }),

  hasMember: Ember.computed.gt('org.selected.membersCount', 0)

});
