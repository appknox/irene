import Ember from 'ember';
import EmberUploader from 'ember-uploader';

const {inject: {service}} = Ember;


const Uploader = EmberUploader.Uploader.extend({
  ajax: service("ajax"),
  async uploadFile(file, url) {
    const that = this;
    const settings = {
      dataType: "text",
      contentType: "application/octet-stream",
      processData: false,
      xhrFields: {
        withCredentials: false
      },
      xhr() {
        const xhr = Ember.$.ajaxSettings.xhr();
        xhr.upload.onprogress = e => that.didProgress(e);
        that.one('isAborting', () => xhr.abort());
        return xhr;
      },
      data: file
    };
    return this.get("ajax").put(url, settings);
  },
});

export default Uploader;
