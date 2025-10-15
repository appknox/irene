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
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import { ModelBaseMixin } from 'irene/mixins/base-model';

import ProjectModel from './project';
import TagModel from './tag';
import FileReportModel from './file-report';
import AnalysisModel from './analysis';
import ProfileModel from './profile';
import SubmissionModel from './submission';

export default class FileModel extends ModelBaseMixin {
  analysesSorting = ['computedRisk:desc'];

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
  declare canRunAutomatedDynamicscan: boolean;

  @attr('number')
  declare riskCountCritical: number;

  @attr('number')
  declare riskCountHigh: number;

  @attr('number')
  declare riskCountLow: number;

  @attr('number')
  declare riskCountMedium: number;

  @attr('number')
  declare riskCountPassed: number;

  @attr('number')
  declare riskCountUnknown: number;

  @attr('number')
  declare devFramework: number;

  @attr('number', { defaultValue: 0 })
  declare overriddenPassedRiskCount: number;

  @hasMany('tag', { async: false, inverse: null })
  declare tags: SyncHasMany<TagModel>;

  @hasMany('file-report', { async: true, inverse: null })
  declare reports: AsyncHasMany<FileReportModel>;

  @belongsTo('project', { inverse: 'files', async: true })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('profile', { inverse: 'files', async: true })
  declare profile: AsyncBelongsTo<ProfileModel>;

  @belongsTo('submission', { async: true, inverse: null })
  declare submission: AsyncBelongsTo<SubmissionModel>;

  @hasMany('analysis', { async: false, inverse: 'file' })
  declare analyses: SyncHasMany<AnalysisModel>;

  @sort<AnalysisModel>('analyses', 'analysesSorting')
  declare sortedAnalyses: ComputedProperty<AnalysisModel[]>;

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

  get comparableVersion() {
    const platform = this.project?.get('platform');
    if (platform === ENUMS.PLATFORM.IOS) {
      return this.version;
    }
    return this.versionCode;
  }

  get screenCoverageSupported() {
    return [ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE].includes(
      this.devFramework
    );
  }

  // Utility methods
  async getLastDynamicScan(
    fileId: string,
    mode: number,
    isScheduledScan = false
  ) {
    const adapter = this.store.adapterFor('file');

    return await adapter.getLastDynamicScan(fileId, mode, isScheduledScan);
  }

  async fetchPreviousFile() {
    const adapter = this.store.adapterFor('file');

    return await adapter.fetchPreviousFile(this.id);
  }

  async getGenerateReportStatus() {
    const adapter = this.store.adapterFor('file');

    return await adapter.getGenerateReportStatus(this.id);
  }

  async getSbomFile() {
    const adapter = this.store.adapterFor('file');

    return await adapter.getSbomFile(this.id);
  }

  async loadAllAnalyses() {
    const adapter = this.store.adapterFor('file');

    return await adapter.loadAllAnalyses(this.id);
  }

  async getFileLastManualDynamicScan() {
    const adapter = this.store.adapterFor('file');

    return await adapter.getFileLastManualDynamicScan(this.id);
  }

  async getFileLastAutomatedDynamicScan() {
    const adapter = this.store.adapterFor('file');

    return await adapter.getFileLastAutomatedDynamicScan(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    file: FileModel;
  }
}
