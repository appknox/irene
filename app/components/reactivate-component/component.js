import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({

  isSuccess: false,

  reactivate: task(function *() {
    const email = this.get("email");
    if(Ember.isEmpty(email)) return this.get("notify").error("Please enter the registered email ID", ENV.notifications);
    const data = {
      email
    };
    yield this.get("ajax").post(ENV.endpoints.reactivate, {data});
    this.set("isSuccess", true);
  }).evented(),

  reactivateErrored: on('reactivate:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }

    this.get("notify").error(errMsg);
  })

});
