/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-component-lifecycle-hooks, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { isNotFoundError } from 'ember-ajax/errors';
import { inject as service } from '@ember/service';

export default Component.extend({
  devicefarm: service('devicefarm'),
  isStorageWorking: false,
  isDeviceFarmWorking: false,
  isAPIServerWorking: false,

  didInsertElement() {
this._super(...arguments);
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
      const isWorking = yield this.devicefarm.testPing();
      this.set('isDeviceFarmWorking', isWorking);
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
