import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { observer } from '@ember/object';
import { translationMacro as t } from 'ember-intl';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import poll from 'irene/services/poll';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
  intl: service(),
  trial: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  poll: service(),

  tagName: '',
  showDynamicScanModal: false,
  showApiScanSettings: false,
  isApiScanEnabled: false,
  tStartingScan: t('startingScan'),

  didInsertElement() {
    this.send('pollDynamicStatus');
  },

  watchStatusChange: observer('file.dynamicStatus', function() {
    if (this.get('file.isDynamicStatusNoneOrReady')) {
      this.set('startingDynamicScan', false);
    }
  }),

  openDynamicScanModal: task(function * () {
    yield this.set('showDynamicScanModal', true);
  }),

  enableApiScan: task(function * (checked) {
    if (checked === true) {
      yield this.set('showApiScanSettings', true);
    } else {
      yield this.set('showApiScanSettings', false);
    }
    this.set('isApiScanEnabled', !!checked);
  }),

  startDynamicScan: task(function * () {
    const data = {
      isApiScanEnabled: this.get('isApiScanEnabled') === true
    };
    const file = this.get('file');
    const fileId = file.id;
    const dynamicUrl = [ENV.endpoints.dynamic, fileId].join('/');
    yield this.get('ajax').put(dynamicUrl, {data});
    file.setBootingStatus();
    this.send('pollDynamicStatus');
  }).evented(),

  startDynamicScanSucceeded: on('startDynamicScan:succeeded', function() {
    const tStartingScan = this.get('tStartingScan');
    this.get('notify').success(tStartingScan);
    this.set('startingDynamicScan', false);
  }),

  startDynamicScanErrored: on('startDynamicScan:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
    this.set('startingDynamicScan', false);

    const file = this.get('file');
    file.setDynamicStatusNone();
  }),

  actions: {
    pollDynamicStatus() {
      const isDynamicReady = this.get('file.isDynamicStatusReady');
      const fileId = this.get('file.id');
      if (isDynamicReady) {
        return;
      }
      if(!fileId) {
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
        if(!this.isDestroyed) {
          this.send('pollDynamicStatus');
          this.set('startingDynamicScan', false);
        }
      },(error) => {
        file.setNone();
        this.set('startingDynamicScan', false);
        this.get('notify').error(error.payload.error);
      });
    },

  }
});
