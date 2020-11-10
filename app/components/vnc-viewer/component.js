import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { t } from 'ember-intl';

const VncViewerComponent = Component.extend({

  rfb: null,
  file: null,
  deviceFarmPassword: ENV.deviceFarmPassword,
  intl: service(),
  devicefarm: service('devicefarm'),
  tCloseModal: t("closeModal"),
  tPopOutModal: t("popOutModal"),
  classNameBindings: ["isPoppedOut:modal", "isPoppedOut:is-active"],
  deviceFarmURL: computed('file.deviceToken', function() {
    const token = this.get('file.deviceToken');
    const deviceSRV = this.get('devicefarm');
    return deviceSRV.getTokenizedWSURL(token);
  }),
  vncPopText: computed('isPoppedOut', 'tCloseModal', 'tPopOutModal', function () {
    const tCloseModal = this.get("tCloseModal");
    const tPopOutModal = this.get("tPopOutModal");
    if (this.get("isPoppedOut")) {
      return tCloseModal;
    } else {
      return tPopOutModal;
    }
  }),

  showVNCControls: computed("file.isReady", "isPoppedOut", function () {
    const isPoppedOut = this.get("isPoppedOut");
    const isReady = this.get("file.isReady");
    if (isPoppedOut || isReady) {
      return true;
    }
  }),


  devicePreference: computed('profileId', 'store', function () {
    const profileId = this.get("profileId");
    if (profileId) {
      return this.get("store").queryRecord("device-preference", { id: profileId });
    }
  }),

  screenRequired: computed("file.project.platform", "devicePreference.deviceType", function () {
    const platform = this.get("file.project.platform");
    const deviceType = this.get("devicePreference.deviceType");
    return (platform === ENUMS.PLATFORM.ANDROID) && (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED);
  }),

  deviceType: computed("file.project.platform", "devicePreference.deviceType", function () {
    const platform = this.get("file.project.platform");
    const deviceType = this.get("devicePreference.deviceType");
    if (platform === ENUMS.PLATFORM.ANDROID) {
      if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
        return "tablet";
      }
      else {
        return "nexus5";
      }
    }
    else if (platform === ENUMS.PLATFORM.IOS) {
      if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
        return "ipad black";
      } else {
        return "iphone5s black";
      }
    }
  }),

  isNotTablet: computed("devicePreference.deviceType", function () {
    const deviceType = this.get("devicePreference.deviceType");
    if (![ENUMS.DEVICE_TYPE.NO_PREFERENCE, ENUMS.DEVICE_TYPE.PHONE_REQUIRED].includes(deviceType)) {
      return true;
    }
  }),

  isIOSDevice: computed("file.project.platform", function () {
    const platform = this.get("file.project.platform");
    if (platform === ENUMS.PLATFORM.IOS) {
      return true;
    }
  }),

  actions: {
    togglePop() {
      this.set("isPoppedOut", !this.get("isPoppedOut"));
    },

    setFocus(focus) {
      const rfb = this.get("rfb");
      const keyboard = rfb.get_keyboard();
      keyboard.set_focused(focus);
    },

    focusKeyboard() {
      this.send('setFocus', true);
    },

    blurKeyboard() {
      this.send('setFocus', false);
    },
  }
});


export default VncViewerComponent;
