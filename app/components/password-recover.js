import Ember from 'ember';
import ENV from 'irene/config/environment';


const PasswordRecoverComponent = Ember.Component.extend({

  identification: "",

  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  mailSent: false,
  isSendingRecoveryEmail: false,

  actions: {

    recover() {
      const identification = this.get('identification').trim();
      if (!identification) {
        return this.get("notify").error("Please enter your Username/Email", ENV.notifications);
      }
      const data =
        {identification};
      this.set("isSendingRecoveryEmail", true);
      this.get("ajax").post(ENV.endpoints.recover, {data})
      .then((data) => {
        this.get("notify").success(data.message);
        if(!this.isDestroyed) {
         this.set("mailSent", true);
         this.set("isSendingRecoveryEmail", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isSendingRecoveryEmail", false);
          this.get("notify").error(error.payload.message);
        }
      });
    }
  }
});

export default PasswordRecoverComponent;
