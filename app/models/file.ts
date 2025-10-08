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
import DynamicscanModel from './dynamicscan';
import type { FileCapiReportScanType } from './file-capi-report';

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

  @attr('number')
  declare devFramework: number;

  @hasMany('tag', { async: false, inverse: null })
  declare tags: SyncHasMany<TagModel>;

  @hasMany('file-report', { async: true, inverse: null })
  declare reports: AsyncHasMany<FileReportModel>;

  @hasMany('analysis', { inverse: 'file', async: false })
  declare analyses: SyncHasMany<AnalysisModel>;

  @belongsTo('project', { inverse: 'files', async: true })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('profile', { inverse: 'files', async: true })
  declare profile: AsyncBelongsTo<ProfileModel>;

  @belongsTo('sbom-file', { inverse: 'file', async: true })
  declare sbFile: AsyncBelongsTo<SbomFileModel>;

  @belongsTo('submission', { async: true, inverse: null })
  declare submission: AsyncBelongsTo<SubmissionModel>;

  @belongsTo('file', { inverse: null, async: true })
  declare previousFile: AsyncBelongsTo<FileModel>;

  @belongsTo('dynamicscan', { async: true, inverse: null })
  declare lastAutomatedDynamicScan: AsyncBelongsTo<DynamicscanModel> | null;

  @belongsTo('dynamicscan', { async: true, inverse: null })
  declare lastManualDynamicScan: AsyncBelongsTo<DynamicscanModel> | null;

  async getLastDynamicScan(
    fileId: string,
    mode: number,
    isScheduledScan = false
  ) {
    const adapter = this.store.adapterFor('file');

    return await adapter.getLastDynamicScan(fileId, mode, isScheduledScan);
  }

  async generateCapiReports(fileTypes: FileCapiReportScanType[]) {
    const adapter = this.store.adapterFor('file');

    return adapter.generateCapiReports(this.id, fileTypes);
  }

  analysesSorting = ['computedRisk:desc'];

  scanProgressClass(type?: boolean) {
    if (type === true) {
      return true;
    }

    return false;
  }

  get isDynamicScanLoading() {
    return (
      this.lastAutomatedDynamicScan?.isPending ||
      this.lastManualDynamicScan?.isPending
    );
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

  get comparableVersion() {
    const platform = this.project?.get('platform');
    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }
    return this.versionCode;
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

  @computed('analyses.@each.computedRisk')
  get dynamicVulnerabilityCount() {
    return this.analyses.filter(
      (it) => it.hasType(ENUMS.VULNERABILITY_TYPE.DYNAMIC) && it.isRisky
    ).length;
  }

  @computed('analyses.@each.computedRisk')
  get apiVulnerabilityCount() {
    return this.analyses.filter(
      (it) => it.hasType(ENUMS.VULNERABILITY_TYPE.API) && it.isRisky
    ).length;
  }

  @computed('analyses.@each.computedRisk')
  get manualVulnerabilityCount() {
    return this.analyses.filter(
      (it) => it.hasType(ENUMS.VULNERABILITY_TYPE.MANUAL) && it.isRisky
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

  get isDynamicScanRunning() {
    const automated = this.lastAutomatedDynamicScan;
    const manual = this.lastManualDynamicScan;

    return (
      automated?.get('isStartingOrShuttingInProgress') ||
      automated?.get('isReadyOrRunning') ||
      manual?.get('isStartingOrShuttingInProgress') ||
      manual?.get('isReadyOrRunning')
    );
  }

  get screenCoverageSupported() {
    return [ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE].includes(
      this.devFramework
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    file: FileModel;
  }
}
