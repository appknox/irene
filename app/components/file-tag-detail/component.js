import Component from '@ember/component';
import { on } from '@ember/object/evented';

import { task } from 'ember-concurrency';

export default Component.extend({

  tagName: '',
  tag: null,
  showRemoveFileTagConfirmBox: false,

  confirmCallback() {
    this.get('deleteFileTag').perform();
  },

  deleteFileTag: task(function* () {
    const tag = this.get("tag");
    const url = `v2/files/${tag.get("ownedFile.id")}/tags/${tag.id}`;
    yield this.get('ajax').delete(url);
  }).evented(),

  deleteFileTagSucceeded: on('deleteFileTag:succeeded', function () {
    const tag = this.get("tag");
    this.set("showRemoveFileTagConfirmBox", false);
    this.get("notify").success("File Tag Deleted Successfully");
    this.get('store').findRecord('file', tag.get("ownedFile.id"));
  }),

  deleteFileTagErrored: on('deleteFileTag:errored', function (_, error) {

    let errMsg = this.get('tPleaseTryAgain');

    if (error.payload) {
      errMsg = error.payload.errors[0].detail;
    } else if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  openRemoveFileTagConfirmBox: task(function* () {
    yield this.set("showRemoveFileTagConfirmBox", true);
  })
});
