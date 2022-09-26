/* eslint-disable ember/no-computed-properties-in-native-classes */
/* eslint-disable ember/no-mixins */
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ENUMS from 'irene/enums';
import { ModelBaseMixin } from 'irene/mixins/base-model';
import { RISK_COLOR_CODE } from 'irene/utils/constants';

const _getAnalysesCount = (analysis, risk) => {
  return analysis.filter((analysis) => analysis.computedRisk === risk).length;
};

class File extends ModelBaseMixin(Model) {
  @service intl;
  @service store;

  @attr('string') uuid;
  @attr('string') deviceToken;
  @attr('string') version;
  @attr('string') versionCode;
  @attr('string') iconUrl;
  @attr('string') md5hash;
  @attr('string') sha1hash;
  @attr('string') name;
  @attr('string') minOsVersion;
  @attr('string') supportedCpuArchitectures;
  @attr('string') supportedDeviceTypes;
  @attr('string') report;

  @attr('number') manual;
  @attr('number') dynamicStatus;
  @attr('number') apiScanProgress;
  @attr('number') staticScanProgress;
  @attr('number') apiScanStatus;

  @attr('boolean') isActive;
  @attr('boolean') isApiDone;
  @attr('boolean') isStaticDone;
  @attr('boolean') isManualDone;
  @attr('boolean') isDynamicDone;
  @attr('boolean') canGenerateReport;
  @attr('boolean') canRunAutomatedDynamicscan;

  @hasMany('tag') tags;
  @hasMany('file-report', { async: true }) reports;
  @hasMany('analysis', { inverse: 'file' }) analyses;

  @belongsTo('project', { inverse: 'files' }) project;
  @belongsTo('profile', { inverse: 'files' }) profile;

  tDeviceInQueue = this.intl.t('deviceInQueue');
  tDeviceBooting = this.intl.t('deviceBooting');
  tDeviceDownloading = this.intl.t('deviceDownloading');
  tDeviceInstalling = this.intl.t('deviceInstalling');
  tDeviceLaunching = this.intl.t('deviceLaunching');
  tDeviceHooking = this.intl.t('deviceHooking');
  tDeviceShuttingDown = this.intl.t('deviceShuttingDown');
  tDeviceCompleted = this.intl.t('deviceCompleted');

  analysesSorting = ['computedRisk:desc'];

  scanProgressClass(type) {
    if (type === true) {
      return true;
    }
    return false;
  }

  get isManualRequested() {
    return this.manual !== ENUMS.MANUAL.NONE;
  }

  get isRunningApiScan() {
    const apiScanStatus = this.apiScanStatus;
    return apiScanStatus == ENUMS.SCAN_STATUS.RUNNING;
  }

  get isApiNotDone() {
    return !this.isApiDone;
  }

  get isStaticCompleted() {
    const isStaticDone = this.isStaticDone;
    return this.scanProgressClass(isStaticDone);
  }

  get isNoneStatus() {
    const status = this.dynamicStatus;
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }

  get isNotNoneStatus() {
    return !this.isNoneStatus;
  }
  get isNotReady() {
    return !this.isReady;
  }

  get isReady() {
    const status = this.dynamicStatus;
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }

  get isDynamicStatusNone() {
    const status = this.dynamicStatus;
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }

  get isDynamicStatusError() {
    const status = this.dynamicStatus;
    return status === ENUMS.DYNAMIC_STATUS.ERROR;
  }

  get isDynamicStatusQueueAndHasAutomation() {
    const status = this.dynamicStatus;
    return (
      status === ENUMS.DYNAMIC_STATUS.INQUEUE && this.canRunAutomatedDynamicscan
    );
  }

  get isDynamicStatusReady() {
    const status = this.dynamicStatus;
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }

  get isDynamicStatusNotReady() {
    return !this.isDynamicStatusReady;
  }

  get isDynamicStatusNotNone() {
    return !this.isDynamicStatusNone;
  }

  get isDynamicStatusNeitherNoneNorReadyNorError() {
    const status = this.dynamicStatus;
    return ![
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.NONE,
      ENUMS.DYNAMIC_STATUS.ERROR,
    ].includes(status);
  }

  get isDynamicStatusNoneOrError() {
    const status = this.dynamicStatus;
    return [ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.ERROR].includes(
      status
    );
  }

  get isDynamicStatusNoneOrReady() {
    const status = this.dynamicStatus;
    return [ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(
      status
    );
  }

  get isDynamicStatusStarting() {
    const status = this.dynamicStatus;
    return ![
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.NONE,
      ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN,
    ].includes(status);
  }

  get isDynamicStatusInProgress() {
    const status = this.dynamicStatus;
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
  }

  get isNeitherNoneNorReady() {
    const status = this.dynamicStatus;
    return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(
      status
    );
  }

  get startingScanStatus() {
    return this.isDynamicStatusStarting;
  }

  get showScheduleAutomatedDynamicScan() {
    const status = this.dynamicStatus;
    return (
      status !== ENUMS.DYNAMIC_STATUS.INQUEUE && this.canRunAutomatedDynamicscan
    );
  }

  get statusText() {
    const tDeviceInQueue = this.tDeviceInQueue;
    const tDeviceBooting = this.tDeviceBooting;
    const tDeviceDownloading = this.tDeviceDownloading;
    const tDeviceInstalling = this.tDeviceInstalling;
    const tDeviceLaunching = this.tDeviceLaunching;
    const tDeviceHooking = this.tDeviceHooking;
    const tDeviceShuttingDown = this.tDeviceShuttingDown;
    const tDeviceCompleted = this.tdeviceCompleted;

    switch (this.dynamicStatus) {
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

  get comparableVersion() {
    const platform = this.project?.get('platform');
    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }
    return this.versionCode;
  }

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
  }

  setBootingStatus() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.BOOTING);
  }

  setInQueueStatus() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.INQUEUE);
  }

  setShuttingDown() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN);
  }

  setNone() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.NONE);
  }

  setDynamicStatusNone() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.NONE);
  }

  setReady() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.READY);
  }

  @sort('analyses', 'analysesSorting') sortedAnalyses;

  @computed('analyses.@each.computedRisk')
  get countRiskCritical() {
    const analyses = this.analyses;
    return _getAnalysesCount(analyses, ENUMS.RISK.CRITICAL);
  }

  @computed('analyses.@each.computedRisk')
  get countRiskHigh() {
    const analyses = this.analyses;
    return _getAnalysesCount(analyses, ENUMS.RISK.HIGH);
  }

  @computed('analyses.@each.computedRisk')
  get countRiskMedium() {
    const analyses = this.analyses;
    return _getAnalysesCount(analyses, ENUMS.RISK.MEDIUM);
  }

  @computed('analyses.@each.computedRisk')
  get countRiskLow() {
    const analyses = this.analyses;
    return _getAnalysesCount(analyses, ENUMS.RISK.LOW);
  }

  @computed('analyses.@each.computedRisk')
  get countRiskNone() {
    const analyses = this.analyses;
    return _getAnalysesCount(analyses, ENUMS.RISK.NONE);
  }

  @computed('analyses.@each.computedRisk')
  get countRiskUnknown() {
    const analyses = this.analyses;
    return _getAnalysesCount(analyses, ENUMS.RISK.UNKNOWN);
  }

  get doughnutData() {
    return {
      labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PASSED', 'UNKNOWN'],
      datasets: [
        {
          label: 'Risks',
          data: [
            this.countRiskCritical,
            this.countRiskHigh,
            this.countRiskMedium,
            this.countRiskLow,
            this.countRiskNone,
            this.countRiskUnknown,
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
  }
}

export default File;
