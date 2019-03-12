import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

const _getComputedColor = function(selector) {
  const el = document.querySelector(`#hiddencolorholder .is-${selector}`);
  const computedStyle = window.getComputedStyle(el);
  return computedStyle.getPropertyValue("color");
};

const File = DS.Model.extend(BaseModelMixin, {
  i18n: service(),
  project: DS.belongsTo('OrganizationProject', {inverse:'files'}),
  profile: DS.belongsTo('profile', {inverse:'files'}),
  name: DS.attr('string'),
  version: DS.attr('string'),
  versionCode: DS.attr('string'),
  md5hash: DS.attr('string'),
  sha1hash: DS.attr('string'),
  dynamicStatus: DS.attr('number'),
  apiScanProgress: DS.attr('number'),
  deviceToken: DS.attr('string'),
  manual: DS.attr('number'),
  isStaticDone: DS.attr('boolean'),
  isDynamicDone: DS.attr('boolean'),
  staticScanProgress: DS.attr('number'),
  apiScanStatus: DS.attr('number'),
  iconUrl: DS.attr('string'),
  rating: DS.attr('string'),
  isManualDone: DS.attr('boolean'),
  isApiDone: DS.attr('boolean'),
  riskCountCritical: DS.attr('number'),
  riskCountHigh: DS.attr('number'),
  riskCountMedium: DS.attr('number'),
  riskCountLow: DS.attr('number'),
  riskCountPassed: DS.attr('number'),
  riskCountUnknown: DS.attr('number'),

  analyses: DS.hasMany('analysis', { inverse: 'file' }),


  isManualRequested: computed('manual', function() {
    return this.get("manual") !== ENUMS.MANUAL.NONE
  }),

  isRunningApiScan: computed('apiScanStatus', function() {
    const apiScanStatus = this.get("apiScanStatus");
    return apiScanStatus == ENUMS.SCAN_STATUS.RUNNING;
  }),

  isApiNotDone: computed.not('isApiDone'),

  scanProgressClass(type){
    if (type === true) {
      return true;
    }
    return false;
  },

  isStaticCompleted: computed('isStaticDone', function() {
    const isStaticDone = this.get("isStaticDone");
    return this.scanProgressClass(isStaticDone);
  }),

  tDeviceBooting: t("deviceBooting"),
  tDeviceDownloading: t("deviceDownloading"),
  tDeviceInstalling: t("deviceInstalling"),
  tDeviceLaunching: t("deviceLaunching"),
  tDeviceHooking: t("deviceHooking"),
  tDeviceShuttingDown: t("deviceShuttingDown"),

  analysesSorting: ['computedRisk:desc'],
  sortedAnalyses: computed.sort('analyses', 'analysesSorting'),

  doughnutData: computed(function() {

    const riskCountCritical = this.get("riskCountCritical");
    const riskCountHigh = this.get("riskCountHigh");
    const riskCountMedium = this.get("riskCountMedium");
    const riskCountLow = this.get("riskCountLow");
    const riskCountPassed = this.get("riskCountPassed");
    const riskCountUnknown = this.get("riskCountUnknown");

    this.set("riskCountCritical", riskCountCritical); // eslint-disable-line
    this.set("riskCountHigh", riskCountHigh); // eslint-disable-line
    this.set("riskCountMedium", riskCountMedium); // eslint-disable-line
    this.set("riskCountLow", riskCountLow); // eslint-disable-line
    this.set("riskCountPassed", riskCountPassed); // eslint-disable-line
    this.set("riskCountUnknown", riskCountUnknown); // eslint-disable-line

    return {
      labels: [
        'CRITICAL',
        'HIGH',
        'MEDIUM',
        'LOW',
        'PASSED',
        'UNKNOWN'
      ],
      datasets: [ {
        label: 'Risks',
        data: [
          riskCountCritical,
          riskCountHigh,
          riskCountMedium,
          riskCountLow,
          riskCountPassed,
          riskCountUnknown
        ],
        backgroundColor: [
         _getComputedColor("critical"),
         _getComputedColor("danger"),
         _getComputedColor("warning"),
         _getComputedColor("info"),
         _getComputedColor("success"),
         _getComputedColor("default")
        ]
      } ]
    };
  }),

  isNoneStatus: computed('dynamicStatus', function() {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }),

  isNotNoneStatus: computed.not('isNoneStatus'),

  isReady: computed('dynamicStatus', function() {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }),

  isNotReady: computed.not('isReady'),

  isNeitherNoneNorReady: computed('dynamicStatus', function() {
    const status = this.get('dynamicStatus');
    return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(status);
  }),

  startingScanStatus: computed('dynamicStatus', function() {
    const status = this.get('dynamicStatus');
    return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN].includes(status);
  }),

  statusText: computed('dynamicStatus', function() {
    const tDeviceBooting = this.get("tDeviceBooting");
    const tDeviceDownloading = this.get("tDeviceDownloading");
    const tDeviceInstalling = this.get("tDeviceInstalling");
    const tDeviceLaunching = this.get("tDeviceLaunching");
    const tDeviceHooking = this.get("tDeviceHooking");
    const tDeviceShuttingDown = this.get("tDeviceShuttingDown");

    switch (this.get("dynamicStatus")) {
      case ENUMS.DYNAMIC_STATUS.BOOTING:
        return tDeviceBooting;
      case ENUMS.DYNAMIC_STATUS.DOWNLOADING:
        return tDeviceDownloading;
      case ENUMS.DYNAMIC_STATUS.INSTALLING:
        return tDeviceInstalling;
      case ENUMS.DYNAMIC_STATUS.LAUNCHING:
        return tDeviceLaunching;
      case ENUMS.DYNAMIC_STATUS.HOOKING:
        return tDeviceHooking;
      case ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN:
        return tDeviceShuttingDown;
      default:
        return "Unknown Status";
    }
  }),

  setDynamicStatus(status) {
    this.store.push({
      data: {
        id: this.id,
        type: this.constructor.modelName,
        attributes: {
            'dynamicStatus': status
        }
      }
    });
  },

  setBootingStatus() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.BOOTING);
  },

  setShuttingDown() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN);
  },

  setNone() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.NONE);
  },

  setReady() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.READY);
  }
}
);


export default File;
