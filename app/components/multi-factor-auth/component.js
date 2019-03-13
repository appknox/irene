import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

const isValidOTP = otp => otp && otp.length > 5;

export default Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  user: null,

  isEnablingAppMFA: false,
  isEnablingEmailMFA: false,
  isDisablingMFA: false,
  showMFAEnableModal: false,
  showMethodSelect: true,
  showMethodApp: false,
  showMethodEmail: false,
  showMethodEmailOTP: false,
  enableAppMFAOTP: null,
  showConfirmDisableMFA: false,
  showDisableMFA: false,

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

  isMFAEmailActive: computed("user.mfaEMethod", function() {
    return this.get("user.mfaMethod") == ENUMS.MFA_METHOD.HOTP;
  }),

  isMFAAppActive: computed("user.mfaEMethod", function() {
    return this.get("user.mfaMethod") == ENUMS.MFA_METHOD.TOTP;
  }),

  openMFAEnableModal: task(function * () {
    yield this.set("showMFAEnableModal", true);
  }).evented(),

  openMFAEnableModalSucceeded: on('openMFAEnableModal:succeeded', function() {
    this.set('showMethodSelect', true);
    this.set('showMethodApp', false);
    this.set('showMethodEmail', false);
    this.set('showMethodEmailOTP', false);
  }),

  openMFADisableModal: task(function * () {
    yield this.set("showMFADisableModal", true);
  }).evented(),

  openMFADisableModalSucceeded: on('openMFADisableModal:succeeded', function() {
    this.set("showConfirmDisableMFA", true);
    this.set("showDisableMFA", false);
  }),

  closeMFAEnableModal: task(function * () {
    yield this.set("showMFAEnableModal", false);
  }),

  closeMFADisableModal: task(function * () {
    yield this.set("showMFADisableModal", false);
  }),

  actions: {
    setMethodSelect() {
      this.set("showMethodSelect", true);
      this.set("showMethodApp", false);
      this.set("showMethodEmail", false);
      this.set("showMethodEmailOTP", false);
    },
    setMethodApp() {
      this.set("showMethodSelect", false);
      this.set("showMethodApp", true);
      this.set("showMethodEmail", false);
      this.set("showMethodEmailOTP", false);
    },
    setMethodEmail() {
      this.set("showMethodSelect", false);
      this.set("showMethodApp", false);
      this.set("showMethodEmail", true);
      this.set("showMethodEmailOTP", false);
    },

    sendOTPEmailMFA() {
      this.get("ajax").post(ENV.endpoints.mfaSendOTPMail)
        .then(() => {
          this.get("notify").success('Sending mail...');
          if(!this.isDestroyed) {
            this.set("showMethodSelect", false);
            this.set("showMethodApp", false);
            this.set("showMethodEmail", false);
            this.set("showMethodEmailOTP", true);
          }
        }, (error) => {
          this.get("notify").error(error.payload.message);
        });
    },

    closeMFASelectModal() {
      this.set("showMFAEnableModal", false);
    },

    enableEmailMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFAEnabled = this.get("tMFAEnabled");
      const enableEmailMFAOTP = this.get("enableEmailMFAOTP");

      for (let otp of [enableEmailMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data = {
        otp: enableEmailMFAOTP,
        method: ENUMS.MFA_METHOD.HOTP,
      };
      this.set("isEnablingEmailMFA", true);

      this.get("ajax").post(ENV.endpoints.mfa, {data})
        .then(() => {
          this.get("notify").success(tMFAEnabled);
          if(!this.isDestroyed) {
            this.set("user.mfaEnabled", true);
            this.set("user.mfaMethod", ENUMS.MFA_METHOD.HOTP);
            this.set("enableEmailMFAOTP", "");
            this.set("showMFAEnableModal", false);
            this.set("isEnablingEmailMFA", false);

            this.set("showMethodSelect", true);
            this.set("showMethodApp", false);
            this.set("showMethodEmail", false);
            this.set("showMethodEmailOTP", false);
          }
        }, (error) => {
          if(!this.isDestroyed) {
            this.set("isEnablingEmailMFA", false);
            this.get("notify").error(error.payload.message);
          }
        });
    },

    enableAppMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFAEnabled = this.get("tMFAEnabled");
      const enableAppMFAOTP = this.get("enableAppMFAOTP");

      for (let otp of [enableAppMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data = {
        otp: enableAppMFAOTP,
        method: ENUMS.MFA_METHOD.TOTP,
      };
      this.set("isEnablingAppMFA", true);

      this.get("ajax").post(ENV.endpoints.mfa, {data})
        .then(() => {
          this.get("notify").success(tMFAEnabled);
          if(!this.isDestroyed) {
            this.set("user.mfaEnabled", true);
            this.set("user.mfaMethod", ENUMS.MFA_METHOD.TOTP);
            this.set("enableAppMFAOTP", "");
            this.set("showMFAEnableModal", false);
            this.set("isEnablingAppMFA", false);

            this.set("showMethodSelect", true);
            this.set("showMethodApp", false);
            this.set("showMethodEmail", false);
            this.set("showMethodEmailOTP", false);
          }
        }, (error) => {
          if(!this.isDestroyed) {
            this.set("isEnablingAppMFA", false);
            this.get("notify").error(error.payload.message);
          }
        });
    },

    confirmDisableMFA() {
      if (this.get("user.mfaMethod") === ENUMS.MFA_METHOD.HOTP) {
        this.get("ajax").post(ENV.endpoints.mfaSendOTPMail)
          .then(() => {
            this.get("notify").success('Sending mail...');
            this.set("showConfirmDisableMFA", false);
            this.set("showDisableMFA", true);
          }, (error) => {
            this.get("notify").error(error.payload.message);
          });
      } else {
        this.set("showConfirmDisableMFA", false);
        this.set("showDisableMFA", true);
      }
    },

    disableMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFADisabled = this.get("tMFADisabled");
      const disableMFAOTP = this.get("disableMFAOTP");
      for (let otp of [disableMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data = {
        otp: disableMFAOTP
      };
      this.set("isDisablingMFA", true);
      this.get("ajax").delete(ENV.endpoints.mfa, {data})
      .then(() => {
        this.get("notify").success(tMFADisabled);
        if(!this.isDestroyed) {
          this.set("user.mfaEnabled", false);
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
