// jshint ignore: start
import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const VncViewerComponent = Ember.Component.extend({

  rfb: null,
  file: null,

  i18n: Ember.inject.service(),
  onboard: Ember.inject.service(),

  tCloseModal: t("closeModal"),
  tPopOutModal: t("popOutModal"),

  classNameBindings: ["isPoppedOut:modal", "isPoppedOut:is-active"],

  vncPopText: (function() {
    const tCloseModal = this.get("tCloseModal");
    const tPopOutModal = this.get("tPopOutModal");
    if (this.get("isPoppedOut")) {
      return tCloseModal;
    } else {
      return tPopOutModal;
    }
  }).property("isPoppedOut"),

  setupRFB() {
    const rfb = this.get("rfb");
    if (!Ember.isEmpty(rfb)) {
      return;
    }
    const canvasEl = this.element.getElementsByClassName("canvas")[0];
    const that = this;
    this.set("rfb", new RFB({
      'target': canvasEl,
      'encrypt': ENV.deviceFarmSsl,
      'repeaterID': '',
      'true_color': true,
      'local_cursor': false,
      'shared': true,
      'view_only': false,

      'onUpdateState'() {
        if (ENUMS.PLATFORM.IOS !== that.get("file.project.platform")) {
          // Only resize iOS Devices
          return true;
        }
        setTimeout(that.set_ratio.bind(that), 500);
        return true;
      },

      'onXvpInit'() {
        return true;
      }
    })
    );

    if (this.get('file.isReady')) {
      return this.send("connect");
    }
  },

  didInsertElement() {
    return this.setupRFB();
  },

  statusChange: ( function() {
    if (this.get('file.isReady')) {
      return this.send("connect");
    } else {
      return this.send("disconnect");
    }
  }).observes('file.dynamicStatus'),

  deviceType: (function() {
    const platform = this.get("file.project.platform");
    const deviceType = this.get("file.project.deviceType");
    if (platform === ENUMS.PLATFORM.ANDROID) {
      return "nexus5";
    } else if (platform === ENUMS.PLATFORM.IOS) {
      if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
        return "ipad black";
      } else {
        return "iphone5s black";
      }
    }
  }).property("file.project.platform", "file.project.deviceType"),

  isNotTablet: (function() {
    const deviceType = this.get("file.project.deviceType");
    if (![ENUMS.DEVICE_TYPE.NO_PREFERENCE, ENUMS.DEVICE_TYPE.PHONE_REQUIRED].includes(deviceType)) {
      return true;
    }
  }).property("file.project.deviceType"),

  isIOSDevice: (function() {
    const platform = this.get("file.project.platform");
    if (platform === ENUMS.PLATFORM.IOS) {
      return true;
    }
  }).property("file.project.platform"),

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
