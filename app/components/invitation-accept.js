/* eslint-disable ember/no-classic-components, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/no-actions-hash, ember/no-get */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';


const InvitationAcceptComponent = Component.extend({

  invitation: null,
  ajax: service(),
  notify: service('notifications'),

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
