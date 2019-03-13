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

const _getAnalysesCount = (analysis, risk)=> {
  return analysis.filterBy('computedRisk', risk).get('length')
};

const File = DS.Model.extend(BaseModelMixin, {
  i18n: service(),
  project: DS.belongsTo('OrganizationProject', {inverse:'files'}),
  profile: DS.belongsTo('profile', {inverse:'files'}),
  uuid: DS.attr('string'),
  deviceToken: DS.attr('string'),
  version: DS.attr('string'),
  versionCode: DS.attr('string'),
  iconUrl: DS.attr('string'),
  md5hash: DS.attr('string'),
  sha1hash: DS.attr('string'),
  name: DS.attr('string'),
  dynamicStatus: DS.attr('number'),
  analyses: DS.hasMany('analysis', {inverse: 'file'}),
  report: DS.attr('string'),
  manual: DS.attr('number'),
  apiScanProgress: DS.attr('number'),
  staticScanProgress: DS.attr('number'),
  isStaticDone: DS.attr('boolean'),
  isDynamicDone: DS.attr('boolean'),
  isManualDone: DS.attr('boolean'),
  isApiDone: DS.attr('boolean'),
  apiScanStatus: DS.attr('number'),

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

  countRiskCritical: 0,
  countRiskHigh: 0,
  countRiskMedium: 0,
  countRiskLow: 0,
  countRiskNone: 0,
  countRiskUnknown: 0,

  doughnutData: computed('analyses.@each.computedRisk', function() {
    const analyses = this.get("analyses");
    const r = ENUMS.RISK;
    const countRiskCritical = _getAnalysesCount(analyses, r.CRITICAL);
    const countRiskHigh = _getAnalysesCount(analyses, r.HIGH);
    const countRiskMedium = _getAnalysesCount(analyses, r.MEDIUM);
    const countRiskLow = _getAnalysesCount(analyses, r.LOW);
    const countRiskNone = _getAnalysesCount(analyses, r.NONE);
    const countRiskUnknown = _getAnalysesCount(analyses, r.UNKNOWN);

    this.set("countRiskCritical", countRiskCritical); // eslint-disable-line
    this.set("countRiskHigh", countRiskHigh); // eslint-disable-line
    this.set("countRiskMedium", countRiskMedium); // eslint-disable-line
    this.set("countRiskLow", countRiskLow); // eslint-disable-line
    this.set("countRiskNone", countRiskNone); // eslint-disable-line
    this.set("countRiskUnknown", countRiskUnknown); // eslint-disable-line

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
          countRiskCritical,
          countRiskHigh,
          countRiskMedium,
          countRiskLow,
          countRiskNone,
          countRiskUnknown
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
