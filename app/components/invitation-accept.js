/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
      return this.get("ajax").post(ENV.endpoints.signup, {data})
      .then(function(data){
        // FIXME: This should be this.transitionTo`
        that.get("notify").success("User got created sucessfully", ENV.notifications);
        return setTimeout(() => window.location.href = "/"
        ,
          3 * 1000);}).catch(function(error) {
        that.get("notify").error(error.payload.message, ENV.notifications);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    }
  }
});

export default InvitationAcceptComponent;
