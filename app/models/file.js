/* eslint-disable ember/no-array-prototype-extensions, ember/no-mixins, ember/no-classic-classes, ember/no-get, ember/avoid-leaking-state-in-ember-objects */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import { t } from 'ember-intl';
import { RISK_COLOR_CODE } from 'irene/utils/constants';

const _getAnalysesCount = (analysis, risk) => {
  return analysis.filterBy('computedRisk', risk).get('length');
};

const File = Model.extend(BaseModelMixin, {
  intl: service(),
  project: belongsTo('project', {
    inverse: 'files',
  }),
  profile: belongsTo('profile', {
    inverse: 'files',
  }),
  uuid: attr('string'),
  deviceToken: attr('string'),
  version: attr('string'),
  versionCode: attr('string'),
  iconUrl: attr('string'),
  md5hash: attr('string'),
  sha1hash: attr('string'),
  name: attr('string'),
  dynamicStatus: attr('number'),
  analyses: hasMany('analysis', {
    inverse: 'file',
  }),
  report: attr('string'),
  manual: attr('number'),
  apiScanProgress: attr('number'),
  staticScanProgress: attr('number'),
  isActive: attr('boolean'),
  isStaticDone: attr('boolean'),
  isDynamicDone: attr('boolean'),
  isManualDone: attr('boolean'),
  isApiDone: attr('boolean'),
  apiScanStatus: attr('number'),
  tags: hasMany('tag'),
  minOsVersion: attr('string'),
  supportedCpuArchitectures: attr('string'),
  supportedDeviceTypes: attr('string'),
  canRunAutomatedDynamicscan: attr('boolean'),
  reports: hasMany('file-report', {
    async: true,
  }),

  isManualRequested: computed('manual', function () {
    return this.get('manual') !== ENUMS.MANUAL.NONE;
  }),

  isRunningApiScan: computed('apiScanStatus', function () {
    const apiScanStatus = this.get('apiScanStatus');
    return apiScanStatus == ENUMS.SCAN_STATUS.RUNNING;
  }),

  isApiNotDone: computed.not('isApiDone'),

  scanProgressClass(type) {
    if (type === true) {
      return true;
    }
    return false;
  },

  isStaticCompleted: computed('isStaticDone', function () {
    const isStaticDone = this.get('isStaticDone');
    return this.scanProgressClass(isStaticDone);
  }),

  tDeviceInQueue: t('deviceInQueue'),
  tDeviceBooting: t('deviceBooting'),
  tDeviceDownloading: t('deviceDownloading'),
  tDeviceInstalling: t('deviceInstalling'),
  tDeviceLaunching: t('deviceLaunching'),
  tDeviceHooking: t('deviceHooking'),
  tDeviceShuttingDown: t('deviceShuttingDown'),
  tDeviceCompleted: t('deviceCompleted'),

  analysesSorting: ['computedRisk:desc'],
  sortedAnalyses: computed.sort('analyses', 'analysesSorting'),

  countRiskCritical: 0,
  countRiskHigh: 0,
  countRiskMedium: 0,
  countRiskLow: 0,
  countRiskNone: 0,
  countRiskUnknown: 0,

  canGenerateReport: attr('boolean'),

  doughnutData: computed('analyses.@each.computedRisk', function () {
    const analyses = this.get('analyses');
    const r = ENUMS.RISK;
    const countRiskCritical = _getAnalysesCount(analyses, r.CRITICAL);
    const countRiskHigh = _getAnalysesCount(analyses, r.HIGH);
    const countRiskMedium = _getAnalysesCount(analyses, r.MEDIUM);
    const countRiskLow = _getAnalysesCount(analyses, r.LOW);
    const countRiskNone = _getAnalysesCount(analyses, r.NONE);
    const countRiskUnknown = _getAnalysesCount(analyses, r.UNKNOWN);

    this.set('countRiskCritical', countRiskCritical); // eslint-disable-line
    this.set('countRiskHigh', countRiskHigh); // eslint-disable-line
    this.set('countRiskMedium', countRiskMedium); // eslint-disable-line
    this.set('countRiskLow', countRiskLow); // eslint-disable-line
    this.set('countRiskNone', countRiskNone); // eslint-disable-line
    this.set('countRiskUnknown', countRiskUnknown); // eslint-disable-line

    return {
      labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PASSED', 'UNKNOWN'],
      datasets: [
        {
          label: 'Risks',
          data: [
            countRiskCritical,
            countRiskHigh,
            countRiskMedium,
            countRiskLow,
            countRiskNone,
            countRiskUnknown,
          ],
          backgroundColor: [
            RISK_COLOR_CODE.CRITICAL,
            RISK_COLOR_CODE.DANGER,
            RISK_COLOR_CODE.WARNING,
            RISK_COLOR_CODE.INFO,
            RISK_COLOR_CODE.SUCCESS,
            RISK_COLOR_CODE.DEFAULT,
          ],
        },
      ],
    };
  }),

  isNoneStatus: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }),

  isNotNoneStatus: computed.not('isNoneStatus'),

  isReady: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }),

  isNotReady: computed.not('isReady'),

  isDynamicStatusNone: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }),

  isDynamicStatusError: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.ERROR;
  }),

  isDynamicStatusQueueAndHasAutomation: computed(
    'dynamicStatus',
    'canRunAutomatedDynamicscan',
    function () {
      const status = this.get('dynamicStatus');
      return (
        status === ENUMS.DYNAMIC_STATUS.INQUEUE &&
        this.get('canRunAutomatedDynamicscan')
      );
    }
  ),
  isDynamicStatusReady: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }),

  isDynamicStatusNotReady: computed.not('isDynamicStatusReady'),
  isDynamicStatusNotNone: computed.not('isDynamicStatusNone'),

  isDynamicStatusNeitherNoneNorReadyNorError: computed(
    'dynamicStatus',
    function () {
      const status = this.get('dynamicStatus');
      return ![
        ENUMS.DYNAMIC_STATUS.READY,
        ENUMS.DYNAMIC_STATUS.NONE,
        ENUMS.DYNAMIC_STATUS.ERROR,
      ].includes(status);
    }
  ),

  isDynamicStatusNoneOrError: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return [ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.ERROR].includes(
      status
    );
  }),

  isDynamicStatusNoneOrReady: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return [ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(
      status
    );
  }),

  isDynamicStatusStarting: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return ![
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.NONE,
      ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN,
    ].includes(status);
  }),

  isDynamicStatusInProgress: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return [
      ENUMS.DYNAMIC_STATUS.INQUEUE,
      ENUMS.DYNAMIC_STATUS.BOOTING,
      ENUMS.DYNAMIC_STATUS.DOWNLOADING,
      ENUMS.DYNAMIC_STATUS.INSTALLING,
      ENUMS.DYNAMIC_STATUS.LAUNCHING,
      ENUMS.DYNAMIC_STATUS.HOOKING,
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN,
    ].includes(status);
  }),

  isNeitherNoneNorReady: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(
      status
    );
  }),

  startingScanStatus: computed('dynamicStatus', function () {
    const status = this.get('dynamicStatus');
    return ![
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.NONE,
      ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN,
    ].includes(status);
  }),

  showScheduleAutomatedDynamicScan: computed(
    'dynamicStatus',
    'canRunAutomatedDynamicscan',
    function () {
      const status = this.get('dynamicStatus');
      return (
        status !== ENUMS.DYNAMIC_STATUS.INQUEUE &&
        this.get('canRunAutomatedDynamicscan')
      );
    }
  ),

  statusText: computed(
    'dynamicStatus',
    'tDeviceBooting',
    'tDeviceDownloading',
    'tDeviceHooking',
    'tDeviceInQueue',
    'tDeviceInstalling',
    'tDeviceLaunching',
    'tDeviceShuttingDown',
    'tdeviceCompleted',
    function () {
      const tDeviceInQueue = this.get('tDeviceInQueue');
      const tDeviceBooting = this.get('tDeviceBooting');
      const tDeviceDownloading = this.get('tDeviceDownloading');
      const tDeviceInstalling = this.get('tDeviceInstalling');
      const tDeviceLaunching = this.get('tDeviceLaunching');
      const tDeviceHooking = this.get('tDeviceHooking');
      const tDeviceShuttingDown = this.get('tDeviceShuttingDown');
      const tDeviceCompleted = this.get('tdeviceCompleted');

      switch (this.get('dynamicStatus')) {
        case ENUMS.DYNAMIC_STATUS.INQUEUE:
          return tDeviceInQueue;
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
        case ENUMS.DYNAMIC_STATUS.COMPLETED:
          return tDeviceCompleted;
        default:
          return 'Unknown Status';
      }
    }
  ),

  setDynamicStatus(status) {
    this.store.push({
      data: {
        id: this.id,
        type: this.constructor.modelName,
        attributes: {
          dynamicStatus: status,
        },
      },
    });
  },

  setBootingStatus() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.BOOTING);
  },

  setInQueueStatus() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.INQUEUE);
  },

  setShuttingDown() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN);
  },

  setNone() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.NONE);
  },

  setDynamicStatusNone() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.NONE);
  },

  setReady() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.READY);
  },
});

export default File;
