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
  @belongsTo('file', { async: true })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('number')
  declare mode: number;

  @attr('number')
  declare status: number;

  // User actions
  @belongsTo('user', { async: true })
  declare startedByUser: AsyncBelongsTo<UserModel>;

  @belongsTo('user', { async: true })
  declare stoppedByUser: AsyncBelongsTo<UserModel>;

  // Scan user preferences
  // @belongsTo('device-preference')
  // declare devicePreference: AsyncBelongsTo<DevicePreferenceModel>;

  @attr('number')
  declare deviceType: number;

  @attr('string')
  declare platformVersion: string;

  @belongsTo('scan-parameter-group')
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

  @belongsTo('available-device')
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

  setReady() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.READY);
  }

  setRunning() {
    this.setDynamicStatus(ENUMS.DYNAMIC_STATUS.RUNNING);
  }

  get isReady() {
    const status = this.status;
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }

  get isDynamicStatusNone() {
    const status = this.status;
    return status === ENUMS.DYNAMIC_STATUS.NONE;
  }

  get isDynamicStatusError() {
    const status = this.status;
    return status === ENUMS.DYNAMIC_STATUS.ERROR;
  }

  get isDynamicStatusReady() {
    const status = this.status;
    return status === ENUMS.DYNAMIC_STATUS.READY;
  }

  get isDynamicStatusNotReady() {
    return !this.isDynamicStatusReady;
  }

  get isDynamicStatusNotNone() {
    return !this.isDynamicStatusNone;
  }

  get isDynamicStatusNeitherNoneNorReadyNorError() {
    const status = this.status;
    return ![
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.NONE,
      ENUMS.DYNAMIC_STATUS.ERROR,
    ].includes(status);
  }

  get isDynamicStatusNoneOrError() {
    const status = this.status;
    return [ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.ERROR].includes(
      status
    );
  }

  get isDynamicStatusNoneOrReady() {
    const status = this.status;
    return [ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(
      status
    );
  }

  get isReadyOrRunning() {
    const status = this.status;
    return [ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.RUNNING].includes(
      status
    );
  }

  get isDynamicStatusStarting() {
    const status = this.status;
    return ![
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.RUNNING,
      ENUMS.DYNAMIC_STATUS.NONE,
      ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN,
    ].includes(status);
  }

  get isDynamicStatusInProgress() {
    const status = this.status;
    return [
      ENUMS.DYNAMIC_STATUS.INQUEUE,
      ENUMS.DYNAMIC_STATUS.BOOTING,
      ENUMS.DYNAMIC_STATUS.DOWNLOADING,
      ENUMS.DYNAMIC_STATUS.INSTALLING,
      ENUMS.DYNAMIC_STATUS.LAUNCHING,
      ENUMS.DYNAMIC_STATUS.HOOKING,
      ENUMS.DYNAMIC_STATUS.READY,
      ENUMS.DYNAMIC_STATUS.RUNNING,
      ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN,
    ].includes(status);
  }

  get isNeitherNoneNorReady() {
    const status = this.status;
    return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE].includes(
      status
    );
  }

  get startingScanStatus() {
    return this.isDynamicStatusStarting;
  }

  get showScheduleAutomatedDynamicScan() {
    const status = this.status;
    return status !== ENUMS.DYNAMIC_STATUS.INQUEUE;
  }

  get isRunning() {
    const status = this.status;
    return status === ENUMS.DYNAMIC_STATUS.RUNNING;
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
    const tDeviceRunning = this.intl.t('inProgress');

    switch (this.status) {
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
      case ENUMS.DYNAMIC_STATUS.RUNNING:
        return tDeviceRunning;
      default:
        return 'Unknown Status';
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    dynamicscan: DynamicscanModel;
  }
}
