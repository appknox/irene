import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import poll from 'irene/services/poll';

export default Component.extend({
  tagName: "",
  apiScanModal: false,
  dynamicScanModal: false,

  i18n: service(),
  trial: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  poll: service(),

  tStartingScan: t("startingScan"),

  didInsertElement() {
    this.send('pollDynamicStatus');
  },

  actions: {

    setAPIScanOption() {
      const tStartingScan = this.get("tStartingScan");
      const isApiScanEnabled = this.get("isApiScanEnabled");
      const data = {
        isApiScanEnabled: isApiScanEnabled === true
      };
      const file = this.get('file');
      const fileId = file.id;
      const dynamicUrl = [ENV.endpoints.dynamic, fileId].join('/');
      this.get("ajax").put(dynamicUrl, {data})
        .then(() => {
          this.get("notify").success(tStartingScan);
          file.setBootingStatus();
          if(!this.isDestroyed) {
            this.send('pollDynamicStatus');
            this.send("closeModal");
            this.set("startingDynamicScan", false);
          }
        }, (error) => {
          file.setNone();
          this.set("startingDynamicScan", false);
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
      const fileId = this.get("file.id");
      const dynamicUrl = [ENV.endpoints.dynamic, fileId].join('/');
      this.get("ajax").delete(dynamicUrl)
      .then(() => {
        if(!this.isDestroyed) {
          this.send('pollDynamicStatus');
          this.set("startingDynamicScan", false);
        }
      },(error) => {
        file.setNone();
        this.set("startingDynamicScan", false);
        this.get("notify").error(error.payload.error);
      });
    },

  }
});
