import Ember from 'ember';

const InvitationListComponent = Ember.Component.extend({

  invitations: (function() {
    return this.get("store").findAll("invitation");
  }).property()
});

export default InvitationListComponent;
