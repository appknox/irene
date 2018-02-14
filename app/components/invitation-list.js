/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';

const InvitationListComponent = Ember.Component.extend({

  invitations: (function() {
    return this.get("store").findAll("invitation");
  }).property()
});

export default InvitationListComponent;
