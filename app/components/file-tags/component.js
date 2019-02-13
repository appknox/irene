import Component from '@ember/component';
import { on } from '@ember/object/evented';
import { isEmpty } from '@ember/utils';

import { task } from 'ember-concurrency';

export default Component.extend({

  file: null,
  newFileTag: null,
  showRemoveFileTagConfirmBox: false,

  confirmCallback() {
    this.get('deleteFileTag').perform();
  },

  deleteFileTag: task(function* () {
    const fileTag = this.get("deletedFileTag");
    const url = `files/${this.get('file.id')}/tags`;
    const data = {
      tag: fileTag
    };
    yield this.get('ajax').delete(url, { data });
  }).evented(),

  deleteFileTagSucceeded: on('deleteFileTag:succeeded', function () {
    this.set("showRemoveFileTagConfirmBox", false);
    this.get("notify").success("File Tag Deleted Successfully");
    this.get('store').findRecord('file', this.get('file.id'));
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

  addFileTag: task(function* () {
    const fileTag = this.get("newFileTag");
    if (isEmpty(fileTag)) {
      throw new Error("Please enter the tag name");
    }
    const url = `files/${this.get('file.id')}/tags`;
    const data = {
      tag: fileTag
    };
    yield this.get('ajax').post(url, { data});
  }).evented(),


  addFileTagSucceeded: on('addFileTag:succeeded', function () {
    this.get("notify").success("File Tag Added Successfully");
    this.get('store').findRecord('file', this.get('file.id'));
    this.set("newFileTag", "");
  }),

  addFileTagErrored: on('addFileTag:errored', function (_, error) {

    let errMsg = this.get('tPleaseTryAgain');

    if (error.payload){
      errMsg = error.payload.errors[0].detail;
    } else if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  openRemoveFileTagConfirmBox: task(function* () {
    this.set("deletedFileTag", event.target.parentElement.parentElement.firstChild.textContent);
    yield this.set("showRemoveFileTagConfirmBox", true);
  })

});
