import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',
  notify: service('notification-messages-service'),

  downloadArchive: task(function * () {
    const downloadURL = yield this.get('archive').downloadURL();

    if(downloadURL){
      window.open(downloadURL);
      return;
    }
    this.get('notify').error('Failed to download archive');

  }).evented()

});
