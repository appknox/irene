import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Component.extend({    

setApiScanStatus: task(function * () {
    let isActive = this.get('capturedapi.is_active')
    const capturedapi = yield this.get("capturedapi")
    capturedapi.set('is_active', !(isActive));
    yield capturedapi.save();
  }).evented(),
  setApiScanStatusSucceeded: on('setApiScanStatus:succeeded', function() {
    this.get('notify').success('Successfully saved the captured api status');
  }),

  setApiScanStatusErrored: on('setApiScanStatus:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),
});
