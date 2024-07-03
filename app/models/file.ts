/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-mixins */
import {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
  SyncHasMany,
} from '@ember-data/model';

import ComputedProperty, { sort } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import { ModelBaseMixin } from 'irene/mixins/base-model';
import { RISK_COLOR_CODE } from 'irene/utils/constants';

import ProjectModel from './project';
import TagModel from './tag';
import FileReportModel from './file-report';
import AnalysisModel from './analysis';
import ProfileModel from './profile';
import SbomFileModel from './sbom-file';
import SubmissionModel from './submission';

const _getAnalysesCount = (
  analysis: SyncHasMany<AnalysisModel>,
  risk: number
) => {
  return analysis.filter((analysis) => analysis.computedRisk === risk).length;
};

export default class FileModel extends ModelBaseMixin {
  @service declare intl: IntlService;
  @service declare store: Store;

  @attr('string')
  declare uuid: string;

  @attr('string')
  declare deviceToken: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare versionCode: string;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare md5hash: string;

  @attr('string')
  declare sha1hash: string;

  @attr('string')
  declare name: string;

  @attr('string')
  declare minOsVersion: string;

  @attr('string')
  declare supportedCpuArchitectures: string;

  @attr('string')
  declare supportedDeviceTypes: string;

  @attr('string')
  declare report: string;

  @attr('number')
  declare manual: number;

  @attr('number')
  declare dynamicStatus: number;

  @attr('number')
  declare apiScanProgress: number;

  @attr('number')
  declare staticScanProgress: number;

  @attr('number')
  declare apiScanStatus: number;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isApiDone: boolean;

  @attr('boolean')
  declare isStaticDone: boolean;

  @attr('boolean')
  declare isManualDone: boolean;

  @attr('boolean')
  declare isDynamicDone: boolean;

  @attr('boolean')
  declare canGenerateReport: boolean;

  @attr('boolean')
  declare canRunAutomatedDynamicscan: boolean;

  @hasMany('tag', { async: false })
  declare tags: SyncHasMany<TagModel>;

  @hasMany('file-report', { async: true })
  declare reports: AsyncHasMany<FileReportModel>;

  @hasMany('analysis', { inverse: 'file', async: false })
  declare analyses: SyncHasMany<AnalysisModel>;

  @belongsTo('project', { inverse: 'files' })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('profile', { inverse: 'files' })
  declare profile: AsyncBelongsTo<ProfileModel>;

  @belongsTo('sbom-file', { inverse: 'file' })
  declare sbFile: AsyncBelongsTo<SbomFileModel>;

  @belongsTo('submission')
  declare submission: AsyncBelongsTo<SubmissionModel>;

  @belongsTo('file', { inverse: null })
  declare previousFile: AsyncBelongsTo<FileModel>;

  analysesSorting = ['computedRisk:desc'];

  scanProgressClass(type?: boolean) {
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
    const tDeviceInQueue = this.intl.t('deviceInQueue');
    const tDeviceBooting = this.intl.t('deviceBooting');
    const tDeviceDownloading = this.intl.t('deviceDownloading');
    const tDeviceInstalling = this.intl.t('deviceInstalling');
    const tDeviceLaunching = this.intl.t('deviceLaunching');
    const tDeviceHooking = this.intl.t('deviceHooking');
    const tDeviceShuttingDown = this.intl.t('deviceShuttingDown');
    const tDeviceCompleted = this.intl.t('deviceCompleted');

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

  setDynamicStatus(status: number) {
    this.store.push({
      data: {
        id: this.id,
        type: FileModel.modelName,
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

  @sort<AnalysisModel>('analyses', 'analysesSorting')
  declare sortedAnalyses: ComputedProperty<AnalysisModel[]>;

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

  @computed('analyses.@each.computedRisk')
  get staticVulnerabilityCount() {
    return this.analyses.filter(
      (it) => it.hasType(ENUMS.VULNERABILITY_TYPE.STATIC) && it.isRisky
    ).length;
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

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    file: FileModel;
  }
}
