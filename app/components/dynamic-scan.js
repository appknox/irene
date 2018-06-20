import Ember from 'ember';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import poll from 'irene/services/poll';

export default Ember.Component.extend({
  tagName: "",
  apiScanModal: false,
  dynamicScanModal: false,

  i18n: Ember.inject.service(),
  trial: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  poll: Ember.inject.service(),

  tStartingScan: t("startingScan"),

  didInsertElement() {
    this.send('pollDynamicStatus');
  },

  actions: {
    dynamicScan() {
      const file = this.get("file");
      file.setBootingStatus();
      const fileId = this.get("file.id");
      const dynamicUrl = [ENV.endpoints.dynamic, fileId].join('/');
      this.get("ajax").request(dynamicUrl)
      .then(() => {
        this.send('pollDynamicStatus');
      }, (error) => {
        file.setNone();
        this.get("notify").error(error.payload.error);
      });
    },

    pollDynamicStatus() {
      const isDynamicReady = this.get('file.isReady');
      const fileId = this.get('file.id');
      if (isDynamicReady) {
        return;
      }
      if(!fileId) {
        return;
      }
      var stopPoll = poll(() => {
        return this.get('store').find('file', fileId)
        .then(() => {
          const dynamicStatus = this.get('file.dynamicStatus');
          if (dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE || dynamicStatus === ENUMS.DYNAMIC_STATUS.READY) {
            stopPoll();
          }
        }, () => {
          stopPoll();
        });
      }, 5000);
    },

    setAPIScanOption() {
      const tStartingScan = this.get("tStartingScan");
      const isApiScanEnabled = this.get("isApiScanEnabled");
      const project_id = this.get("file.project.id");
      const apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join('/');
      const data =
        {isApiScanEnabled};
      this.get("ajax").post(apiScanOptions, {data})
      .then(() => {
        this.get("notify").success(tStartingScan);
        if(!this.isDestroyed) {
          this.set("startingDynamicScan", false);
          this.send("closeModal");
          this.send("dynamicScan");
        }
      }, (error) => {
        this.get("notify").error(error.payload.error);
      });
    },

    doNotRunAPIScan() {
      triggerAnalytics('feature', ENV.csb.runDynamicScan);
      this.set("isApiScanEnabled", false);
      this.set("startingDynamicScan", true);
      this.send("setAPIScanOption");
    },

    runAPIScan() {
      triggerAnalytics('feature', ENV.csb.runAPIScan);
      this.set("startingDynamicScan", true);
      this.set("isApiScanEnabled", true);
      this.send("setAPIScanOption");
    },

    showURLFilter(param){
      this.set("showAPIURLFilterScanModal", true);
      if (param === 'api') {
        this.set("showAPIScanModal", false);
        this.set("apiScanModal", true);
        this.set("dynamicScanModal", false);
      }
      if (param === 'dynamic') {
        this.set("showRunDynamicScanModal", false);
        this.set("dynamicScanModal", true);
        this.set("apiScanModal", false);
      }
    },

    openAPIScanModal() {
      const platform = this.get("file.project.platform");
      if ([ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS].includes(platform)) { // TEMPIOSDYKEY
        this.set("showAPIScanModal", true);
      } else {
        this.send("doNotRunAPIScan");
      }
    },

    goBack() {
      this.set("showAPIURLFilterScanModal", false);
      if (this.get("apiScanModal")) {
        this.set("showAPIScanModal", true);
      }
      if (this.get("dynamicScanModal")) {
        this.set("showRunDynamicScanModal", true);
      }
    },

    closeModal() {
      this.set("showAPIScanModal", false);
      this.set("showAPIURLFilterScanModal", false);
      this.set("showRunDynamicScanModal", false);
    },

    openRunDynamicScanModal() {
      this.set("showRunDynamicScanModal", true);
    },

    closeRunDynamicScanModal() {
      this.set("showRunDynamicScanModal", false);
    },

    dynamicShutdown() {
      const file = this.get("file");
      file.setShuttingDown();
      this.set("isPoppedOut", false);
      const file_id = this.get("file.id");
      const shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join('/');
      this.get("ajax").request(shutdownUrl)
      .then(() => {
        if(!this.isDestroyed) {
          file.setNone();
        }
      }, (error) => {
        file.setNone();
        this.get("notify").error(error.payload.error);
      });
    },

  }
});
