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
      const that = this;
      const data =
        {identification};
      this.set("isSendingRecoveryEmail", true);
      this.get("ajax").post(ENV.endpoints.recover, {data})
      .then(function(data) {
        that.get("notify").success(data.message);
        if(!that.isDestroyed) {
         that.set("mailSent", true);
         that.set("isSendingRecoveryEmail", false);
        }
       })
      .catch(function(error) {
        if(!that.isDestroyed) {
          that.set("isSendingRecoveryEmail", false);
          that.get("notify").error(error.payload.message);
        }
      });
    }
  }
});

export default PasswordRecoverComponent;
