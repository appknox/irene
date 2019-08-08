import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const PasswordRecoverComponent = Component.extend({
  i18n: service(),
  identification: "",

  ajax: service(),
  notify: service('notification-messages-service'),

  mailSent: false,
  isSendingRecoveryEmail: false,
  tInvalidUsernameOrEmail: t("invalidUsernameOrEmail"),

  actions: {

    recover() {
      const identification = this.get('identification').trim();
      if (!identification) {
        return this.get("notify").error(this.get("tInvalidUsernameOrEmail"), ENV.notifications);
      }
      const data =
        {identification};
      this.set("isSendingRecoveryEmail", true);
      this.get("ajax").post(ENV.endpoints.recover, {data})
      .then((data) => {
        if(!this.isDestroyed) {
         this.get("notify").success(data.message);
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
