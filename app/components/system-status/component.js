/* jshint ignore:start */

import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import {isNotFoundError} from 'ember-ajax/errors';

export default Ember.Component.extend({

  isStorageWorking: false,
  isDeviceFarmWorking: false,

  didRender() {
    this.get("getStorageStatus").perform();
    this.get('getDeviceFarmStatus').perform();
  },

  getDeviceFarmStatus: task(function *() {
    yield this.get("ajax").request(ENV.endpoints.ping);
  }).evented(),

  getDeviceFarmStatusSucceeded: on('getDeviceFarmStatus:succeeded', function() {
    this.set("isDeviceFarmWorking", true);
  }),

  getStorageStatus: task(function *() {
    try {
      let connection = yield this.get("ajax").request(ENV.endpoints.connection);
      yield this.get('ajax').request(connection.storage, { headers:{ 'Authorization': "Basic"}});
    }
    catch(error) {
      if(isNotFoundError(error)) {
        this.set("isStorageWorking", true);
      }
      else {
        this.set("isStorageWorking", false);
      }
    }
  })

});

/* jshint ignore:end */
