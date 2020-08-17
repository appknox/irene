import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';

export default Component.extend({
  intl: service(),
  trial: service(),
  ajax: service(),
  notify: service('notifications'),
  realtime: service(),

  capturedApisCount: 0,
  showApiScanModal: false,

  tStartingApiScan: t("startingApiScan"),

  hasDynamicScanDone: computed.reads('file.isDynamicDone'),

  /* fetch captured apis count */
  setCapturedApisCount: task(function* () {
    const url = [ENV.endpoints.files, this.get('file.id'), "capturedapis"].join('/');
    let data = { fileId: this.get('file.id') };
    let apis = yield this.get("ajax").request(url, { namespace: ENV.namespace_v2, data });
    this.get('realtime').incrementProperty('CapturedApiCounter');
    try {
      this.set('capturedApisCount', apis.count);
    } catch (error) {
      this.get("notify").error(error.toString());
    }
  }),


  /* API scan modal actions */
  openApiScanModal: task(function* () {
    if (this.get('hasDynamicScanDone')) {
      yield this.get('setCapturedApisCount').perform();
    }
    triggerAnalytics('feature',ENV.csb.apiScanBtnClick);
    yield this.set('showApiScanModal', true);
  }),

  closeApiScanModal: task(function* () {
    yield this.set('showApiScanModal', false);
  }),


  /* init API scan */
  startApiScan: task(function* () {
    const fileId = this.get('file.id');
    const dynamicUrl = [ENV.endpoints.files, fileId, ENV.endpoints.capturedApiScanStart].join('/');
    return yield this.get("ajax").post(dynamicUrl, { namespace: ENV.namespace_v2 });
  }),

  runApiScan: task(function* () {
    yield this.set('showApiScanModal', false);
    yield this.get('startApiScan').perform();
  }).evented(),

  runApiScanSucceeded: on('runApiScan:succeeded', function () {
    triggerAnalytics('feature', ENV.csb.runAPIScan);
    this.get('notify').success(this.get('tStartingApiScan'));
  }),

  runApiScanErrored: on('runApiScan:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.payload && err.payload.detail) {
      errMsg = err.payload.detail;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),
});
