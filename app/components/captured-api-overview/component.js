import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Component.extend({    

setApiScanStatus: task(function * () {
  
    let isActive = this.get('capturedapi.isActive')
    const capturedapi = yield this.get("capturedapi")
    try{
      yield this.get('someAction').perform(capturedapi, isActive);

    }catch(error){
      this.get("notify").error(error.toString());
    }

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
