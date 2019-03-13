import Component from '@ember/component';
import { on } from '@ember/object/evented';
import { isEmpty } from '@ember/utils';

import { task } from 'ember-concurrency';

export default Component.extend({
  file: null,
  newFileTag: null,
  labelColor: "#000000",

  addFileTag: task(function* () {
    const tag = this.get("newFileTag");
    const color = this.get("labelColor");

    if (isEmpty(tag)) {
      throw new Error("Please enter the tag name");
    }
    const url = `v2/files/${this.get('file.id')}/tags`;
    const data = {
      name: tag,
      color: color
    };
    yield this.get('ajax').post(url, { data });
  }).evented(),


  addFileTagSucceeded: on('addFileTag:succeeded', function () {
    this.get("notify").success("File Tag Added Successfully");
    this.get('store').findRecord('file', this.get('file.id'));
    this.set("newFileTag", "");
  }),

  addFileTagErrored: on('addFileTag:errored', function (_, error) {

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

  actions: {
    colorChanged(color) {
      this.set("labelColor", color);
    }
  }
});
