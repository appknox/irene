import Ember from 'ember';
import Uploader from 'irene/utils/uploader';
import EmberUploader from 'ember-uploader';
import { translationMacro as t } from 'ember-i18n';

const UploadAppComponent = EmberUploader.FileField.extend({
  store: Ember.inject.service('store'),
  delegate: null,
  i18n: Ember.inject.service("i18n"),

  tErrorWhileFetching: t("errorWhileFetching"),
  tErrorWhileUploading: t("errorWhileUploading"),
  tFileUploadedSuccessfully: t("fileUploadedSuccessfully"),
  notify: Ember.inject.service("notification-messages"),

  classNames: ["file-input"],
  async filesDidChange(files) {
    const delegate = this.get("delegate");
    if (Ember.isEmpty(files)) {
      return;
    }
    delegate.set("isUploading", true);
    delegate.set("progress", 0);
    const uploader = Uploader.create({container: this.container});
    uploader.on('progress', e => delegate.set("progress", parseInt(e.percent)));
    try {
      const uploadItem = await this.get("store").queryRecord('uploadApp', {});
      await uploader.uploadFile(files[0], uploadItem.get('url'));
      await uploadItem.save()
      this.get("notify").success(this.get('tFileUploadedSuccessfully'));
    } catch(e) {
      // eslint-disable-next-line no-console
      console.log(e);
      this.get("notify").error(this.get('tErrorWhileUploading'));
    }
    // eslint-disable-next-line no-undef
    $('input[type=file]').val('');
    delegate.set("isUploading", false);
  },
});


export default UploadAppComponent;
