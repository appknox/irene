import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { translationMacro as t } from 'ember-i18n';
import { observer } from '@ember/object';
import ENUMS from 'irene/enums';
import poll from 'irene/services/poll';
import { isEmpty } from '@ember/utils';

export default DS.Model.extend({
    i18n: service(),
    allocatedDuration: DS.attr("string"),
    deviceToken: DS.attr("string"),
    file: DS.attr("number"),
    isApiScanEnabled: DS.attr("boolean"),
    status: DS.attr("number"),
    videoTaken: DS.attr("string"),
    capturedapis: DS.attr("number"),
    startDate: DS.attr('date'),
    errorCode: DS.attr('string'),
    errorMessage: DS.attr('string'),
    startedAt: computed("startDate", function() {
      const startDate = this.get("startDate");
      if (isEmpty(startDate)) {
        return;
      }
      let options = { hour: "numeric", minute: "numeric", hour12:true};
      return `${startDate.toLocaleTimeString([],options)}`;
    }),
    inProgress : computed('status',function(){
      const status = this.get('status');
      return ![ENUMS.DYNAMIC_STATUS.ERROR, ENUMS.DYNAMIC_STATUS.COMPLETED].includes(status);
    }),
    poll: service(),
    tDeviceBooting: t("deviceBooting"),
    tDeviceAllocating: t("deviceAllocating"),
    tDeviceDownloading: t("deviceDownloading"),
    tDeviceInstalling: t("deviceInstalling"),
    tDeviceLaunching: t("deviceLaunching"),
    tDeviceHooking: t("deviceHooking"),
    tDeviceShuttingDown: t("deviceShuttingDown"),
    tDeviceCompleted : t("deviceCompleted"),
    tDeviceError: t('deviceError'),
    tDeviceReady: t('deviceReady'),
    tDeviceInQueue:t('deviceInQueue'),
    numericID: computed('id', function() { return Number(this.get('id')) }),
    isNoneStatus: computed('status', function() {
      const status = this.get('status');
      return status === ENUMS.DYNAMIC_STATUS.NONE;
    }),
    isPolRunning: null,
    isNotNoneStatus: computed.not('isNoneStatus'),
    isNotCompleted: computed('status',function(){
      const status = this.get('status');
      return ![ENUMS.DYNAMIC_STATUS.COMPLETED].includes(status);
    }),
    isReady: computed('status', function() {
      const status = this.get('status');
      return status === ENUMS.DYNAMIC_STATUS.READY;
    }),
    isCompleted: computed('status', function(){
      const status = this.get('status');
      return status === ENUMS.DYNAMIC_STATUS.COMPLETED;
    }),
    isNotReady: computed.not('isReady'),
    isError: computed('status', function() {
      const status = this.get('status');
      return status === ENUMS.DYNAMIC_STATUS.ERROR;
    }),
    isNeitherNoneNorReadyNorCompleted: computed('status', function() {
      const status = this.get('status');
      return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.COMPLETED].includes(status);
    }),

    startingScanStatus: computed('status', function() {
      const status = this.get('status');
      return ![ENUMS.DYNAMIC_STATUS.READY, ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN, ENUMS.DYNAMIC_STATUS.COMPLETED].includes(status);
    }),

    statusText: computed('status', function() {
      const tDeviceBooting = this.get("tDeviceBooting");
      const tDeviceDownloading = this.get("tDeviceDownloading");
      const tDeviceInstalling = this.get("tDeviceInstalling");
      const tDeviceLaunching = this.get("tDeviceLaunching");
      const tDeviceHooking = this.get("tDeviceHooking");
      const tDeviceShuttingDown = this.get("tDeviceShuttingDown");
      const tDeviceAllocating = this.get("tDeviceAllocating");
      const tDeviceCompleted = this.get("tDeviceCompleted");
      const tDeviceError = this.get('tDeviceError');
      const tDeviceInQueue = this.get('tDeviceInQueue');
      switch (this.get("status")) {
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
        case ENUMS.DYNAMIC_STATUS.ALLOCATING:
          return tDeviceAllocating;
        case ENUMS.DYNAMIC_STATUS.COMPLETED:
          return tDeviceCompleted;
        case ENUMS.DYNAMIC_STATUS.INQUEUE:
          return tDeviceInQueue;
        case ENUMS.DYNAMIC_STATUS.ERROR:
          return tDeviceError;
        default:
          return "Unknown Status";
      }
    }),
    pollDynamicStatus() {
      // this.set
      let isPolRunning = this.get('isPolRunning')
      if (isPolRunning){
        return;
      }
      this.set('isPolRunning', true);
      var stopPoll = poll(() => {
        return this.get('store').find('dynamicscan', this.get('id'))
          .then(() => {
            if (!this.get('shouldPoll')){
              stopPoll();
            }
          }, () => {
            stopPoll();
          });
      }, 5000);
    },
    shouldPoll:computed('status', function(){
      const status = this.get('status');
      return ![ENUMS.DYNAMIC_STATUS.COMPLETED, ENUMS.DYNAMIC_STATUS.ERROR].includes(status)
    }),
    pollingObserver: observer('status', function(){
      this.pollDynamicStatus();
    }),
    createDynamicScan(fileId) {
      var adapter = this.store.adapterFor(this.constructor.modelName);
      return adapter.createDynamicScan(this.store, this.constructor.modelName, this, fileId);
    },
    currentDynamicScan(fileId) {
      var adapter = this.store.adapterFor(this.constructor.modelName);
      return adapter.currentDynamicScan(this.store, this.constructor.modelName, this, fileId);
    },
});
