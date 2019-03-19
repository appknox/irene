import Component from '@ember/component';
import { on } from '@ember/object/evented';

import { task } from 'ember-concurrency';

export default Component.extend({

  tagName: '',
  tagColor: '',
  tag: null,
  showRemoveFileTagConfirmBox: false,
  showEditTagTemplate: false,


  confirmCallback() {
    this.get('deleteFileTag').perform();
  },

  didInsertElement() {
    this.setTag();
  },

  setTag() {
    const tag = this.get("tag");
    this.set('tagName', tag.get("name"));
    this.set('tagColor', tag.get("color"));
  },

  deleteFileTag: task(function* () {
    const tag = this.get("tag");
    const url = `v2/files/${tag.get("ownedFile.id")}/tags/${tag.id}`;
    yield this.get('ajax').delete(url);
  }).evented(),

  saveFileTag: task(function* () {
    const tag = this.get("tag");
    const url = `v2/files/${tag.get("ownedFile.id")}/tags/${tag.id}`;
    const data = {
      name: this.get("tagName"),
      color: this.get("tagColor")
    };
    yield this.get('ajax').put(url, { data });
  }).evented(),

  saveFileTagSucceeded: on('saveFileTag:succeeded', function () {
    const tag = this.get("tag");
    this.get("notify").success("File Tag Updated Successfully");
    this.set("showEditTagTemplate", false);
    this.get('store').findRecord('file', tag.get("ownedFile.id"));
  }),

  deleteFileTagSucceeded: on('deleteFileTag:succeeded', function () {
    const tag = this.get("tag");
    this.set("showRemoveFileTagConfirmBox", false);
    this.get("notify").success("File Tag Deleted Successfully");
    this.get('store').findRecord('file', tag.get("ownedFile.id"));
  }),

  savingErrored: on('deleteFileTag:errored', 'saveFileTag:errored', function (_, error) {

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
  }),

  editFileTag: task(function* () {
    this.setTag();
    yield this.set("showEditTagTemplate", true);
  }),

  cancelEditing: task(function* () {
    yield this.set("showEditTagTemplate", false);
  }),

  actions: {
    colorChanged(color) {
      this.set(this.get("tag.color"), color);
    }
  }

});
