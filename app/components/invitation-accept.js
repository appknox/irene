import Ember from 'ember';
import ENV from 'irene/config/environment';


const InvitationAcceptComponent = Ember.Component.extend({

  invitation: null,
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  actions: {
    acceptInvite() {
      const data = {
        invitationUuid: this.get("invitation.id"),
        username: this.get("username"),
        password: this.get("password")
      };
      this.get("ajax").post(ENV.endpoints.signup, {data})
      .then(() => {
        // FIXME: This should be this.transitionTo`
        this.get("notify").success("User got created sucessfully", ENV.notifications);
        if(!this.isDestroyed) {
          setTimeout(() => window.location.href = "/", 3 * 1000);
        }
      }, (error) => {
        this.get("notify").error(error.payload.message, ENV.notifications);
      });
    }
  }
});

export default InvitationAcceptComponent;
