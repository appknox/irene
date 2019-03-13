import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

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
    const rfb = this.get("rfb");
    if (!isEmpty(rfb)) {
      return;
    }
    const canvasEl = this.element.getElementsByClassName("canvas")[0];
    const that = this;
    // eslint-disable-next-line no-undef
    this.set("rfb", new RFB({
      'target': canvasEl,
      'encrypt': ENV.deviceFarmSsl,
      'repeaterID': '',
      'true_color': true,
      'local_cursor': false,
      'shared': true,
      'view_only': false,

      'onUpdateState'() {
        setTimeout(that.set_ratio.bind(that), 500);
        return true;
      },

      'onXvpInit'() {
        return true;
      }
    })
    );

    this.send("blurKeyboard");

    if (this.get('file.isReady')) {
      return this.send("connect");
    }
  },

  didInsertElement() {
    return this.setupRFB();
  },

  showVNCControls: computed("file.isReady", "isPoppedOut", function() {
    const isPoppedOut = this.get("isPoppedOut");
    const isReady = this.get("file.isReady");
    if(isPoppedOut || isReady) {
      return true;
    }
  }),

  statusChange: observer('file.dynamicStatus', function() {
    if (this.get('file.isReady')) {
      return this.send("connect");
    } else {
      return this.send("disconnect");
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

  set_ratio() {
    const rfb = this.get("rfb");
    const display = rfb.get_display();
    const canvasEl = display.get_context().canvas;
    const bounding_rect = canvasEl.getBoundingClientRect();
    const scaleRatio = display.autoscale(bounding_rect.width, bounding_rect.height);
    return rfb.get_mouse().set_scale(scaleRatio);
  },

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

    connect() {
      const rfb = this.get("rfb");
      const deviceToken = this.get("file.deviceToken");
      rfb.connect(ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', `${ENV.deviceFarmPath}?token=${deviceToken}`);
      setTimeout(this.set_ratio.bind(this), 500);
    },

    disconnect() {
      const rfb = this.get("rfb");
      if (rfb._rfb_connection_state === 'connected') {
        rfb.disconnect();
      }
      if (rfb._rfb_connection_state === 'disconnected') {
        this.set("rfb", null);
        this.setupRFB();
      }
    }
  }
});


export default VncViewerComponent;
