import Ember from 'ember';

const InvitationListComponent = Ember.Component.extend({

  orgInvitations: (function() {
    return this.get("store").query('organization-invitation', {id: this.get("organization.id")});
  }).property(),
});

export default InvitationListComponent;
