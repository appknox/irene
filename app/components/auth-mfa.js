// jshint ignore: start
import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const isValidOTP = otp => otp.length > 5;

const AuthMfaComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  user: null,
  showMFAIntro: true,
  showBarCode: false,
  enableMFAOTP: null,
  disableMFAOTP: null,

  isEnablingMFA: false,
  isDisablingMFA: false,

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
    openMFAEnableModal() {
      this.set("showMFAEnableModal", true);
      this.set("showMFAIntro", true);
      this.set("showBarCode", false);
    },

    openMFADisableModal() {
      this.set("showMFADisableModal", true);
    },

    closeMFAEnableModal() {
      this.set("showMFAEnableModal", false);
    },

    closeMFADisableModal() {
      this.set("showMFADisableModal", false);
    },

    showBarCode() {
      this.set("showBarCode", true);
      this.set("showMFAIntro", false);
    },

    enableMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFAEnabled = this.get("tMFAEnabled");
      const enableMFAOTP = this.get("enableMFAOTP");
      for (let otp of [enableMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data =
        {otp: enableMFAOTP};
      this.set("isEnablingMFA", true);
      this.get("ajax").post(ENV.endpoints.enableMFA, {data})
      .then(() => {
        this.get("notify").success(tMFAEnabled);
        if(!this.isDestroyed) {
          this.set("enableMFAOTP", "");
          this.set("showMFAEnableModal", false);
          this.set("isEnablingMFA", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isEnablingMFA", false);
          this.get("notify").error(error.payload.message);
        }
      });
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
