import Component from '@ember/component';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { isNotFoundError } from 'ember-ajax/errors';

export default Component.extend({
  isStorageWorking: false,
  isDeviceFarmWorking: false,
  isAPIServerWorking: false,

  didInsertElement() {
    this.get('getStorageStatus').perform();
    this.get('getDeviceFarmStatus').perform();
    this.get('getAPIServerStatus').perform();
  },

  getStorageStatus: task(function* () {
    try {
      let status = yield this.get('ajax').request(ENV.endpoints.status);
      yield this.get('ajax').request(status.data.storage, { headers: {} });
    } catch (error) {
      this.set('isStorageWorking', !!isNotFoundError(error));
    }
  }).drop(),

  getDeviceFarmStatus: task(function* () {
    try {
      const url = [ENV.devicefarmHost, ENV.endpoints.ping].join('/');
      yield this.get('ajax').request(url);
      this.set('isDeviceFarmWorking', true);
    } catch (_) {
      this.set('isDeviceFarmWorking', false);
    }
  }).drop(),

  getAPIServerStatus: task(function* () {
    try {
      yield this.get('ajax').request(ENV.endpoints.ping);
      this.set('isAPIServerWorking', true);
    } catch (_) {
      this.set('isAPIServerWorking', false);
    }
  }).drop(),
});
