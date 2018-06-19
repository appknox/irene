import Ember from 'ember';
import ENV from 'irene/config/environment';
import EmberUploader from 'ember-uploader';
import { translationMacro as t } from 'ember-i18n';

const {inject: {service}} = Ember;


const Uploader = EmberUploader.Uploader.extend({

  ajax: service("ajax"),
  notify: service("notification-messages"),
  i18n: service("i18n"),

  tErrorWhileFetching: t("errorWhileFetching"),
  tErrorWhileUploading: t("errorWhileUploading"),
  tFileUploadedSuccessfully: t("fileUploadedSuccessfully"),

  upload(file, delegate) {

    const tErrorWhileFetching = this.get("tErrorWhileFetching");
    const tErrorWhileUploading = this.get("tErrorWhileUploading");
    const tFileUploadedSuccessfully = this.get("tFileUploadedSuccessfully");
    const that = this;
    const signSuccess = (json) => {
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
      this.get("ajax").put(json.url, settings)
      .then(() => {
        this.didUpload(json.file_key, json.file_key_signed);
        this.get("notify").success(tFileUploadedSuccessfully);
      }, () => {
        delegate.set("isUploading", false);
        this.get("notify").error(tErrorWhileUploading);
      });
    };

    const data =
      {content_type: "application/octet-stream"};

    this.get("ajax").request(ENV.endpoints.signedUrl, {data})
    .then((json) => {
      $('input[type=file]').val('');
      signSuccess(json);
    }, () => {
      delegate.set("isUploading", false);
      $('input[type=file]').val('');
      this.get("notify").error(tErrorWhileFetching);
    });
  }
});

export default Uploader;
