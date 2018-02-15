import Ember from 'ember';
import Uploader from 'irene/utils/uploader';
import ENV from 'irene/config/environment';

const UploadAppComponent = EmberUploader.FileField.extend({

  delegate: null,
  classNames: ["file-input"],

  filesDidChange(files) {

    const that = this;
    const delegate = this.get("delegate");
    delegate.set("isUploading", true);
    if (Ember.isEmpty(files)) {
      return;
    }
    const uploader = Uploader.create({container: this.container});

    uploader.didUpload = function(file_key, file_key_signed) {
      delegate.set("isUploading", false);
      const data = {
        file_key,
        file_key_signed
      };
      that.get("ajax").post(ENV.endpoints.uploadedFile, {data});
    };

    uploader.on('progress', e => delegate.set("progress", parseInt(e.percent)));

    return uploader.upload(files[0], delegate)
    .catch(function() {
      $('input[type=file]').val('');
      delegate.set("isUploading", false);
    });
  }
});


export default UploadAppComponent;
