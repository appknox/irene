import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({

  router: Ember.inject.service("-routing"),

  reactivate: task(function *() {

    const email = this.get("email");
    const data = {
      email
    };
    return yield this.get("ajax").post(ENV.endpoints.reactivate, data);
  }),

  reactivateSucceeded: on('reactivate:succeeded', function() {
    this.get("notify").info("Your account has been activated. Please login to continue");
    this.get("router").transitionTo('login');
  }),

  reactivateErrorred: on('reactivate:errored', function(_,error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
  })



});
