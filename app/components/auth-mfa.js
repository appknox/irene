import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

const isValidOTP = otp => otp.length > 5;

const AuthMfaComponent = Component.extend({

  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  user: null,

  isEnablingMFA: false,
  isDisablingMFA: false,

  tMFAEnabled: t("mfaEnabled"),
  tMFADisabled: t("mfaDisabled"),


  actions: {
    openMFASelectMethodModal() {
      this.set("showMFASelectMethodModal", true);
    },

    openMFADisableModal() {
      this.set("showMFADisableModal", true);
    },

    closeMFAEnableModal() {
      this.set("showMFASelectMethodModal", false);
    },

    closeMFADisableModal() {
      this.set("showMFADisableModal", false);
    },


    disableMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFADisabled = this.get("tMFADisabled");
      const disableMFAOTP = this.get("disableMFAOTP");
      for (let otp of [disableMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data =
        {otp: disableMFAOTP};
      this.set("isDisablingMFA", true);
      this.get("ajax").post(ENV.endpoints.disableMFA, {data})
      .then(() => {
        this.get("notify").success(tMFADisabled);
        if(!this.isDestroyed) {
          this.set("disableMFAOTP", "");
          this.set("showMFADisableModal", false);
          this.set("isDisablingMFA", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isDisablingMFA", false);
          this.get("notify").error(error.payload.message);
        }
      });
    }
  }
});


export default AuthMfaComponent;
