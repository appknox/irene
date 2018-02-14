/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

const _getComputedColor = function(selector) {
  const el = document.querySelector(`#hiddencolorholder .is-${selector}`);
  const computedStyle = window.getComputedStyle(el);
  return computedStyle.getPropertyValue("color");
};

const _getAnalysesCount = (analyses, risk)=> analyses.filterBy('risk', risk).get('length');

const File = DS.Model.extend(BaseModelMixin, {
  i18n: Ember.inject.service(),
  project: DS.belongsTo('project', {inverse:'files'}),
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
  manual: DS.attr('boolean'),
  apiScanProgress: DS.attr('number'),
  staticScanProgress: DS.attr('number'),
  isStaticDone: DS.attr('boolean'),
  isDynamicDone: DS.attr('boolean'),
  isManualDone: DS.attr('boolean'),
  isApiDone: DS.attr('boolean'),

  ifManualNotRequested: (function() {
    const manual = this.get('manual');
    return !manual;
  }).property('manual'),

  isRunningApiScan: (function() {
    const apiScanProgress = this.get("apiScanProgress");
    if ([0,100].includes(apiScanProgress)) {
      return false;
    }
    return true;
  }).property("apiScanProgress"),

  isApiNotDone: Ember.computed.not('isApiDone'),

  scanProgressClass(type){
    if (type === true) {
      return true;
    }
    return false;
  },

  isStaticCompleted: (function() {
    const isStaticDone = this.get("isStaticDone");
    return this.scanProgressClass(isStaticDone);
  }).property("isStaticDone"),

  tDeviceBooting: t("deviceBooting"),
  tDeviceDownloading: t("deviceDownloading"),
  tDeviceInstalling: t("deviceInstalling"),
  tDeviceLaunching: t("deviceLaunching"),
  tDeviceHooking: t("deviceHooking"),
  tDeviceShuttingDown: t("deviceShuttingDown"),

  analysesSorting: ['risk:desc'],
  sortedAnalyses: Ember.computed.sort('analyses', 'analysesSorting'),

  countRiskCritical: 0,
  countRiskHigh: 0,
  countRiskMedium: 0,
  countRiskLow: 0,
  countRiskNone: 0,
  countRiskUnknown: 0,

  doughnutData: Ember.computed('analyses.@each.risk', function() {
    const analyses = this.get("analyses");
    const r = ENUMS.RISK;
    const countRiskCritical = _getAnalysesCount(analyses, r.CRITICAL);
    const countRiskHigh = _getAnalysesCount(analyses, r.HIGH);
    const countRiskMedium = _getAnalysesCount(analyses, r.MEDIUM);
    const countRiskLow = _getAnalysesCount(analyses, r.LOW);
    const countRiskNone = _getAnalysesCount(analyses, r.NONE);
    const countRiskUnknown = _getAnalysesCount(analyses, r.UNKNOWN);

    this.set("countRiskCritical", countRiskCritical);
    this.set("countRiskHigh", countRiskHigh);
    this.set("countRiskMedium", countRiskMedium);
    this.set("countRiskLow", countRiskLow);
    this.set("countRiskNone", countRiskNone);
    this.set("countRiskUnknown", countRiskUnknown);

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


  isNoneStatus: (function() {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }).property('dynamicStatus'),

  isNotNoneStatus: Ember.computed.not('isNoneStatus'),

  isReady: (function() {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }).property('dynamicStatus'),

  isNotReady: Ember.computed.not('isReady'),

  isNeitherNoneNorReady: (function() {
    const status = this.get('dynamicStatus');
    return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(status);
  }).property('dynamicStatus'),

  statusText: (function() {
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
  }).property('dynamicStatus'),

  setBootingStatus() {
    return this.set("dynamicStatus", ENUMS.DYNAMIC_STATUS.BOOTING);
  },

  setShuttingDown() {
    return this.set("dynamicStatus", ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN);
  },

  setNone() {
    return this.set("dynamicStatus", ENUMS.DYNAMIC_STATUS.NONE);
  },

  setReady() {
    return this.set("dynamicStatus", ENUMS.DYNAMIC_STATUS.READY);
  }
}
);


export default File;
