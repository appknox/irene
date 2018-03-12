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
      const that = this;
      for (let otp of [enableMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data =
        {otp: enableMFAOTP};
      this.set("isEnablingMFA", true);
      this.get("ajax").post(ENV.endpoints.enableMFA, {data})
      .then(function(){
        that.get("notify").success(tMFAEnabled);
        if(!that.isDestroyed) {
          that.set("enableMFAOTP", "");
          that.set("showMFAEnableModal", false);
          that.set("isEnablingMFA", false);
        }
      })
      .catch(function(error) {
        if(!that.isDestroyed) {
          that.set("isEnablingMFA", false);
          that.get("notify").error(error.payload.message);
        }
      });
    },

    disableMFA() {
      const tEnterOTP = this.get("tEnterOTP");
      const tMFADisabled = this.get("tMFADisabled");
      const disableMFAOTP = this.get("disableMFAOTP");
      const that = this;
      for (let otp of [disableMFAOTP]) {
        if (!isValidOTP(otp)) { return this.get("notify").error(tEnterOTP); }
      }
      const data =
        {otp: disableMFAOTP};
      this.set("isDisablingMFA", true);
      this.get("ajax").post(ENV.endpoints.disableMFA, {data})
      .then(function(){
        that.get("notify").success(tMFADisabled);
        if(!that.isDestroyed) {
          that.set("disableMFAOTP", "");
          that.set("showMFADisableModal", false);
          that.set("isDisablingMFA", false);
        }
      })
      .catch(function(error) {
        if(!that.isDestroyed) {
          that.set("isDisablingMFA", false);
          that.get("notify").error(error.payload.message);
        }
      });
    }
  }
});


export default AuthMfaComponent;
