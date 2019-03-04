import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import RFB from '@novnc/novnc/core/rfb';

const VncViewerComponent = Component.extend({

  rfb: null,
  file: null,

  i18n: service(),
  onboard: service(),

  tCloseModal: t("closeModal"),
  tPopOutModal: t("popOutModal"),

  classNameBindings: ["isPoppedOut:modal", "isPoppedOut:is-active"],

  vncPopText: computed('isPoppedOut', function() {
    const tCloseModal = this.get("tCloseModal");
    const tPopOutModal = this.get("tPopOutModal");
    if (this.get("isPoppedOut")) {
      return tCloseModal;
    } else {
      return tPopOutModal;
    }
  }),

  setupRFB() {
    const canvasEl = this.element.getElementsByClassName("canvas-container")[0];
    const deviceToken = this.get("file.deviceToken");
    const deviceFarmURL =
      `wss://${ENV.deviceFarmHost}/${ENV.deviceFarmPath}?token=${deviceToken}`

    const rfb = new RFB(
      canvasEl,
      deviceFarmURL, {
        'credentials': {
            'password': ENV.deviceFarmPassword
        }
      }
    );
    rfb.addEventListener('connect', () => {
      const platform = this.get("file.project.platform");
      if (platform === ENUMS.PLATFORM.IOS) {
        rfb.scaleViewport = true;
      }
    });
    this.set("rfb", rfb);
  },

  didInsertElement() {
    if (this.get("file.isReady")) {
      return this.setupRFB();
    }
  },

  showVNCControls: computed("file.isReady", "isPoppedOut", function() {
    const isPoppedOut = this.get("isPoppedOut");
    const isReady = this.get("file.isReady");
    if(isPoppedOut || isReady) {
      return true;
    }
  }),

  statusChange: observer('file.dynamicStatus', function() {
    const dynamicStatus = this.get("file.dynamicStatus");
    if (dynamicStatus === ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN) {
      return this.send("disconnect");
    }
    if (this.get("file.isReady")) {
      return this.setupRFB();
    }
  }),

  devicePreference: computed('profileId', function() {
    const profileId = this.get("profileId");
    if(profileId) {
      return this.get("store").queryRecord("device-preference", {id: profileId});
    }
  }),

  screenRequired: computed("file.project.platform", "devicePreference.deviceType", function() {
     const platform = this.get("file.project.platform");
     const deviceType = this.get("devicePreference.deviceType");
     return (platform === ENUMS.PLATFORM.ANDROID) && (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED);
   }),

  deviceType: computed("file.project.platform", "devicePreference.deviceType", function() {
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

  isNotTablet: computed("devicePreference.deviceType", function() {
    const deviceType = this.get("devicePreference.deviceType");
    if (![ENUMS.DEVICE_TYPE.NO_PREFERENCE, ENUMS.DEVICE_TYPE.PHONE_REQUIRED].includes(deviceType)) {
      return true;
    }
  }),

  isIOSDevice: computed("file.project.platform", function() {
    const platform = this.get("file.project.platform");
    if (platform === ENUMS.PLATFORM.IOS) {
      return true;
    }
  }),

  actions: {
    togglePop() {
      this.set("isPoppedOut", !this.get("isPoppedOut"));
    },

    disconnect() {
      const rfb = this.get("rfb");
      if (rfb._rfb_connection_state === 'connected') {
        rfb.disconnect();
      }
    }
  }
});


export default VncViewerComponent;
