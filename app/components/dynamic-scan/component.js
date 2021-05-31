import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { observer } from '@ember/object';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import poll from 'irene/services/poll';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
  intl: service(),
  trial: service(),
  ajax: service(),
  store: service(),
  notify: service('notifications'),

  tagName: '',
  showDynamicScanModal: false,
  showApiScanSettings: false,
  isApiScanEnabled: false,
  tStartingScan: t('startingScan'),
  tScheduleDynamicscanSuccess: t('scheduleDynamicscanSuccess'),

  didInsertElement() {
this._super(...arguments);
    this.send('pollDynamicStatus');
  },

  watchStatusChange: observer('file.dynamicStatus', function () {
    if (this.get('file.isDynamicStatusNoneOrReady')) {
      this.set('startingDynamicScan', false);
    }
  }),

  openDynamicScanModal: task(function* () {
    triggerAnalytics('feature',ENV.csb.dynamicScanBtnClick);
    yield this.set('showDynamicScanModal', true);
    yield this.get('store').find('file', this.get('file.id'));
  }),

  enableApiScan: task(function* (checked) {
    if (checked === true) {
      yield this.set('showApiScanSettings', true);
    } else {
      yield this.set('showApiScanSettings', false);
    }
    this.set('isApiScanEnabled', !!checked);
  }),

  startDynamicScan: task(function* () {
    const data = {
      isApiScanEnabled: this.get('isApiScanEnabled') === true
    };
    const file = this.get('file');
    const fileId = file.id;
    const dynamicUrl = [ENV.endpoints.dynamic, fileId].join('/');
    yield this.get('ajax').put(dynamicUrl, { data });
    file.setBootingStatus();
    this.send('pollDynamicStatus');
  }).evented(),

  startDynamicScanSucceeded: on('startDynamicScan:succeeded', function () {
    const tStartingScan = this.get('tStartingScan');
    this.get('notify').success(tStartingScan);
    this.set('startingDynamicScan', false);
  }),

  startDynamicScanErrored: on('startDynamicScan:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
    this.set('startingDynamicScan', false);

    const file = this.get('file');
    file.setDynamicStatusNone();
  }),

  scheduleDynamicScan: task(function* () {
    const file = this.get('file');
    const fileId = file.id;
    const scheduleAutomationUrl = [ENV.endpoints.dynamic, fileId, ENV.endpoints.scheduleDynamicscanAutomation].join('/');
    yield this.get('ajax').post(scheduleAutomationUrl, {data: {id: fileId}});
  }).evented(),

  scheduleDynamicScanSucceeded: on('scheduleDynamicScan:succeeded', function () {
    const file = this.get('file');
    file.setInQueueStatus();
    this.set('showDynamicScanModal', false);
    this.get('notify').success(this.get('tScheduleDynamicscanSuccess'), {
      clearDuration: 5000
    });
  }),

  scheduleDynamicScanErrored: on('scheduleDynamicScan:errored', function (_, e) {
    this.set('showDynamicScanModal', false);
    let errMsg = this.get('tPleaseTryAgain');
    if (e.payload) {
      Object.keys(e.payload).forEach(p => {
        errMsg = e.payload[p]
        if (typeof(errMsg) !== "string") {
          errMsg = e.payload[p][0];
        }
        this.get('notify').error(errMsg);
      });
      return;
    } else if (e.errors && e.errors.length) {
      errMsg = e.errors[0].detail || errMsg;
    } else if(e.message) {
      errMsg = e.message;
    }
    this.get('notify').error(errMsg);
    return;
  }),

  actions: {
    pollDynamicStatus() {
      const isDynamicReady = this.get('file.isDynamicStatusReady');
      const fileId = this.get('file.id');
      if (isDynamicReady) {
        return;
      }
      if (!fileId) {
        return;
      }
      var stopPoll = poll(() => {
        return this.get('store').find('file', fileId)
          .then(() => {
            const dynamicStatus = this.get('file.dynamicStatus');
            if (dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE || dynamicStatus === ENUMS.DYNAMIC_STATUS.READY) {
              stopPoll();
            }
          }, () => {
            stopPoll();
          });
      }, 5000);
    },

    runDynamicScan() {
      triggerAnalytics('feature', ENV.csb.runDynamicScan);
      this.set('startingDynamicScan', true);
      this.set('showDynamicScanModal', false);
      this.get('startDynamicScan').perform();
    },

    dynamicShutdown() {
      const file = this.get('file');
      file.setShuttingDown();
      this.set('isPoppedOut', false);
      const fileId = this.get('file.id');
      const dynamicUrl = [ENV.endpoints.dynamic, fileId].join('/');
      this.get('ajax').delete(dynamicUrl)
        .then(() => {
          if (!this.isDestroyed) {
            this.send('pollDynamicStatus');
            this.set('startingDynamicScan', false);
          }
        }, (error) => {
          file.setNone();
          this.set('startingDynamicScan', false);
          this.get('notify').error(error.payload.error);
        });
    },

  }
});
