import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import UserModel from './user';
import ENUMS from 'irene/enums';
// import DevicePreferenceModel from './device-preference';
import AvailableDeviceModel from './available-device';
import ScanParameterModel from './scan-parameter';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import FileModel from './file';

export default class DynamicscanModel extends Model {
  @service declare intl: IntlService;

  // Generic dynamic scan info
  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('number')
  declare mode: number;

  @attr('number')
  declare status: number;

  // User actions
  @belongsTo('user', { async: true, inverse: null })
  declare startedByUser: AsyncBelongsTo<UserModel>;

  @belongsTo('user', { async: true, inverse: null })
  declare stoppedByUser: AsyncBelongsTo<UserModel>;

  // Scan user preferences
  // @belongsTo('device-preference')
  // declare devicePreference: AsyncBelongsTo<DevicePreferenceModel>;

  @attr('number')
  declare deviceType: number;

  @attr('string')
  declare platformVersion: string;

  @belongsTo('scan-parameter-group', { async: true, inverse: null })
  declare scanParameterGroups: AsyncBelongsTo<ScanParameterModel>;

  @attr('boolean')
  declare enableApiCapture: boolean;

  @attr()
  declare apiCaptureFilters: unknown; //TODO: Check this type <json default=list>

  @attr('string')
  declare proxyHost: string;

  @attr('string')
  declare proxyPort: string;

  // Devicefarm scan info
  @attr('string')
  declare moriartyDynamicscanId: string;

  @attr('string')
  declare moriartyDynamicscanToken: string;

  @attr()
  declare deviceUsed: unknown; //TODO: Check this type <json default=dict>

  @attr('string')
  declare errorCode: string;

  @attr('string')
  declare errorMessage: string;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare endedOn: Date;

  @attr('date')
  declare timeoutOn: Date;

  @attr('date')
  declare autoShutdownOn: Date;

  // Post interaction
  @attr('boolean')
  declare isAnalysisDone: boolean;

  @attr('number')
  declare time: number;

  @belongsTo('available-device', { async: true, inverse: null })
  declare availableDevice: AsyncBelongsTo<AvailableDeviceModel>;

  async extendTime(time: number) {
    const adapter = this.store.adapterFor('dynamicscan');

    return await adapter.extendTime('dynamicscan', this, time);
  }

  setDynamicStatus(status: number) {
    this.store.push({
      data: {
        id: this.id,
        type: DynamicscanModel.modelName,
        attributes: {
          status,
        },
      },
    });
  }

  setDynamicScanMode(mode: number) {
    this.store.push({
      data: {
        id: this.id,
        type: DynamicscanModel.modelName,
        attributes: {
          mode,
        },
      },
    });
  }

  setDynamicScanModeManual() {
    this.setDynamicScanMode(ENUMS.DYNAMIC_MODE.MANUAL);
  }

  setDynamicScanModeAuto() {
    this.setDynamicScanMode(ENUMS.DYNAMIC_MODE.AUTOMATED);
  }

  setShuttingDown() {
    this.setDynamicStatus(ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED);
  }

  setNone() {
    this.setDynamicStatus(ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED);
  }

  get isNone() {
    return this.status === ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED;
  }

  get isNotNone() {
    return !this.isNone;
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
      ENUMS.DYNAMIC_SCAN_STATUS.DOWNLOADING_AUTO_SCRIPT,
      ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_AUTO_INTERACTION,
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

  get isNotReady() {
    return !this.isReady;
  }

  get isRunning() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.INITIATING_AUTO_INTERACTION,
      ENUMS.DYNAMIC_SCAN_STATUS.AUTO_INTERACTION_COMPLETED,
    ].includes(this.status);
  }

  get isShuttingDown() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED,
      ENUMS.DYNAMIC_SCAN_STATUS.SCAN_TIME_LIMIT_EXCEEDED,
      ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
      ENUMS.DYNAMIC_SCAN_STATUS.CLEANING_DEVICE,
      ENUMS.DYNAMIC_SCAN_STATUS.RUNTIME_DETECTION_COMPLETED,
      ENUMS.DYNAMIC_SCAN_STATUS.TERMINATED,
    ].includes(this.status);
  }

  get isStatusError() {
    return [
      ENUMS.DYNAMIC_SCAN_STATUS.ERROR,
      ENUMS.DYNAMIC_SCAN_STATUS.TIMED_OUT,
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

  get isDynamicStatusInProgress() {
    return (
      this.isInqueue ||
      this.isBooting ||
      this.isInstalling ||
      this.isLaunching ||
      this.isHooking ||
      this.isShuttingDown
    );
  }

  get isDynamicStatusNoneOrError() {
    return this.isNone || this.isStatusError;
  }

  get isReadyOrRunning() {
    return this.isReady || this.isRunning;
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

    if (this.isRunning) {
      return this.intl.t('inProgress');
    }

    if (this.isShuttingDown) {
      return this.intl.t('deviceShuttingDown');
    }

    if (this.isCompleted) {
      return this.intl.t('deviceCompleted');
    }

    if (this.isStatusError) {
      return this.intl.t('error');
    }

    if (this.isCancelled) {
      return this.intl.t('cancelled');
    }

    return this.intl.t('unknown');
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    dynamicscan: DynamicscanModel;
  }
}
