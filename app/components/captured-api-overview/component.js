/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Component.extend({
  toggleApiSelect: task(function * () {
    let isActive = this.get('capturedapi.isActive');
    const capturedapi = yield this.get('capturedapi');
    yield this.get('toggleApi').perform(capturedapi, isActive);
  }).evented(),

  toggleApiSelectSucceeded: on('toggleApiSelect:succeeded', function() {
    this.get('notify').success('Successfully saved the captured api status');
  }),

  toggleApiSelectErrored: on('toggleApiSelect:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get('notify').error(errMsg);
  }),
});
