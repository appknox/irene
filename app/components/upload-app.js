import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import FileUploader from 'irene/utils/uploader';
import FileField from 'ember-uploader/components/file-field';
import { translationMacro as t } from 'ember-i18n';
import $ from 'jquery';

const UploadAppComponent = FileField.extend({
  store: service('store'),
  delegate: null,
  i18n: service("i18n"),
  rollbar: service('rollbar'),


  tErrorWhileFetching: t("errorWhileFetching"),
  tErrorWhileUploading: t("errorWhileUploading"),
  tFileUploadedSuccessfully: t("fileUploadedSuccessfully"),
  notify: service("notification-messages"),

  classNames: ["file-input"],
  async filesDidChange(files) {
    const delegate = this.get("delegate");
    if (isEmpty(files)) {
      return;
    }
    delegate.set("isUploading", true);
    delegate.set("progress", 0);
    const uploader = FileUploader.create({container: this.container});
    uploader.on('progress', e => delegate.set("progress", parseInt(e.percent)));
    try {
      const uploadItem = await this.get("store").queryRecord('uploadApp', {});
      await uploader.uploadFile(files[0], uploadItem.get('url'));
      await uploadItem.save()
      this.get("notify").success(this.get('tFileUploadedSuccessfully'));
    } catch(e) {
      // eslint-disable-next-line no-console
      const err = this.get('tErrorWhileUploading');
      this.get("notify").error(err);
      this.get('rollbar').critical(err, e);
    }
    $('input[type=file]').val('');
    delegate.set("isUploading", false);
  },
});


export default UploadAppComponent;
