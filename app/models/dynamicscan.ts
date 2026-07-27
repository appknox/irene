import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type UserModel from './user';
import type FileModel from './file';
import type ScenarioUserRoleModel from './scenario-user-role';
import type { RawDeviceType } from './device';

export enum DsComputedStatus {
  NOT_STARTED,
  IN_PROGRESS,
  RUNNING,
  COMPLETED,
  CANCELLED,
  ERROR,
}

export default class DynamicscanModel extends Model {
  @service declare intl: IntlService;

  // Generic dynamic scan info
  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('string')
  declare packageName: string;

  @attr('number')
  declare mode: number;

  @attr('string')
  declare modeDisplay: string;

  @attr('number')
  declare engine: number;

  @attr('number')
  declare status: number;

  @attr('string')
  declare statusDisplay: string;

  @attr('string')
  declare moriartyDynamicscanrequestId: string;

  @attr('string')
  declare moriartyDynamicscanId: string;

  @attr('string')
  declare moriartyDynamicscanToken: string;

  // User actions
  @belongsTo('user', { async: true, inverse: null })
  declare startedByUser: AsyncBelongsTo<UserModel>;

  @belongsTo('user', { async: true, inverse: null })
  declare stoppedByUser: AsyncBelongsTo<UserModel> | null;

  @attr('date')
  declare createdOn: Date;

  @attr('date', { allowNull: true })
  declare endedOn: Date | null;

  @attr('date', { allowNull: true })
  declare autoShutdownOn: Date | null;

  @attr()
  declare deviceUsed: RawDeviceType | null;

  @attr()
  declare devicePreference: unknown;

  @attr('string')
  declare errorCode: string;

  @attr('string')
  declare errorMessage: string;

  @attr('boolean')
  declare isNavigationGraphGenerated: boolean;

  @belongsTo('scenario-user-role', { async: false, inverse: null })
  declare scenarioUserRole: ScenarioUserRoleModel | null;

  async extendTime(time: number) {
    const adapter = this.store.adapterFor('dynamicscan');

    return await adapter.extendTime('dynamicscan', this, time);
  }

  get isNone() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED;
  }

  get isInqueue() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.PREPROCESSING,
      ENUMS.DYNAMIC_SCAN_STATUS.PROCESSING_SCAN_REQUEST,
      ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
    ].includes(this.status);
  }

  get isBooting() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
      ENUMS.DYNAMIC_SCAN_STATUS.CONNECTING_TO_DEVICE,
      ENUMS.DYNAMIC_SCAN_STATUS.PREPARING_DEVICE,
      ENUMS.DYNAMIC_SCAN_STATUS.DOWNLOADING_AUTOPILOT_SCRIPT,
      ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_AUTOPILOT,
    ].includes(this.status);
  }

  get isInstalling() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING;
  }

  get isLaunching() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING;
  }

  get isHooking() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_API_CAPTURE,
      ENUMS.DYNAMIC_SCAN_STATUS.HOOKING,
    ].includes(this.status);
  }

  get isReady() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION;
  }

  get isRunning() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
      ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_COMPLETED,
    ].includes(this.status);
  }

  get isShuttingDown() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED,
      ENUMS.DYNAMIC_SCAN_STATUS.SCAN_TIME_LIMIT_EXCEEDED,
      ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
      ENUMS.DYNAMIC_SCAN_STATUS.CLEANING_DEVICE,
      ENUMS.DYNAMIC_SCAN_STATUS.RUNTIME_DETECTION_COMPLETED,
    ].includes(this.status);
  }

  get isStatusError() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
      ENUMS.DYNAMIC_SCAN_STATUS.TIMED_OUT,
      ENUMS.DYNAMIC_SCAN_STATUS.TERMINATED,
    ].includes(this.status);
  }

  get isCompleted() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.ANALYZING,
      ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
    ].includes(this.status);
  }

  get isCancelled() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED;
  }

  get isRetrying() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.RETRYING;
  }

  get isStarting() {
    return (
      this.isInqueue ||
      this.isBooting ||
      this.isInstalling ||
      this.isLaunching ||
      this.isHooking
    );
  }

  get isStartingOrShuttingInProgress() {
    return this.isStarting || this.isShuttingDown;
  }

  get isReadyOrRunning() {
    return this.isReady || this.isRunning;
  }

  get computedStatus() {
    if (this.isStartingOrShuttingInProgress) {
      return DsComputedStatus.IN_PROGRESS;
    }

    if (this.isReadyOrRunning) {
      return DsComputedStatus.RUNNING;
    }

    if (this.isCompleted) {
      return DsComputedStatus.COMPLETED;
    }

    if (this.isCancelled) {
      return DsComputedStatus.CANCELLED;
    }

    if (this.isStatusError) {
      return DsComputedStatus.ERROR;
    }

    return DsComputedStatus.NOT_STARTED;
  }

  get statusText() {
    if (this.isInqueue) {
      return this.intl.t('deviceInQueue');
    }

    if (this.isBooting) {
      return this.intl.t('deviceBooting');
    }

    if (this.isInstalling) {
      return this.intl.t('deviceInstalling');
    }

    if (this.isLaunching) {
      return this.intl.t('deviceLaunching');
    }

    if (this.isHooking) {
      return this.intl.t('deviceHooking');
    }

    if (this.isRetrying) {
      return this.intl.t('retrying');
    }

    if (this.isReadyOrRunning) {
      return this.intl.t('running');
    }

    if (this.isShuttingDown) {
      return this.intl.t('deviceShuttingDown');
    }

    if (this.isCompleted) {
      return this.intl.t('deviceCompleted');
    }

    if (this.isStatusError) {
      return this.intl.t('errored');
    }

    if (this.isCancelled) {
      return this.intl.t('cancelled');
    }

    return this.intl.t('unknown');
  }

  get isAutopiloted() {
    return this.engine === ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT;
  }

  get isScheduledInternally() {
    return this.engine === ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    dynamicscan: DynamicscanModel;
  }
}
