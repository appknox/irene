import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const isValidOTP = otp => otp && otp.length > 5;

export default Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  user: null,

  showEnableMFAModal: true,
  showMethodSelect: true,
  showMethodApp: false,
  showMethodEmail: false,
  enableAppMFAOTP: null,
  isEnablingAppMFA: false,
  isEnablingEmailMFA: false,

  tEnterOTP: t("enterOTP"),
  tMFAEnabled: t("mfaEnabled"),
  tMFADisabled: t("mfaDisabled"),

  didInsertElement() {
    const provisioningURL = this.get("user.provisioningURL");
    // eslint-disable-next-line no-undef
    return new QRious({
      element: this.element.querySelector("canvas"),
      background: 'white',
      backgroundAlpha: 0.8,
      foreground: 'black',
      foregroundAlpha: 0.8,
      level: 'H',
      padding: 25,
      size: 300,
      value: provisioningURL
    });
  },


  actions: {
    setMethodSelect() {
      this.set("showMethodSelect", true);
      this.set("showMethodApp", false);
      this.set("showMethodEmail", false);
    },
    setMethodApp() {
      this.set("showMethodSelect", false);
      this.set("showMethodApp", true);
      this.set("showMethodEmail", false);
    },
    setMethodEmail() {
      this.set("showMethodSelect", false);
      this.set("showMethodApp", false);
      this.set("showMethodEmail", true);
    },

    closeMFASelectModal() {
      this.set("showEnableMFAModal", false);
    },

    enableEmailMFA() {

    },

    enableAppMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFAEnabled = this.get("tMFAEnabled");
      const enableAppMFAOTP = this.get("enableAppMFAOTP");

      for (let otp of [enableAppMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data = {otp: enableAppMFAOTP};
      this.set("isEnablingAppMFA", true);

      this.get("ajax").post(ENV.endpoints.enableMFA, {data})
      .then(() => {
        this.get("notify").success(tMFAEnabled);
        if(!this.isDestroyed) {
          this.set("enableAppMFAOTP", "");
          this.set("showMFAEnableModal", false);
          this.set("isEnablingAppMFA", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isEnablingAppMFA", false);
          this.get("notify").error(error.payload.message);
        }
      });
    },

  }
});
