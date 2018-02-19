import Ember from 'ember';
import ENV from 'irene/config/environment';


const InvitationAcceptComponent = Ember.Component.extend({

  invitation: null,

  actions: {
    acceptInvite() {
      const that = this;
      const data = {
        invitationUuid: this.get("invitation.id"),
        username: this.get("username"),
        password: this.get("password")
      };
      this.get("ajax").post(ENV.endpoints.signup, {data})
      .then(function(){
        // FIXME: This should be this.transitionTo`
        that.get("notify").success("User got created sucessfully", ENV.notifications);
        setTimeout(() => window.location.href = "/", 3 * 1000);})
      .catch(function(error) {
        that.get("notify").error(error.payload.message, ENV.notifications);
      });
    }
  }
});

export default InvitationAcceptComponent;
