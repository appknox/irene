import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import FileUploader from 'irene/utils/uploader';
import FileField from 'ember-uploader/components/file-field';
import { translationMacro as t } from 'ember-intl';
import $ from 'jquery';
import rollbar from 'rollbar';

const UploadAppComponent = FileField.extend({
  store: service('store'),
  delegate: null,
  intl: service('intl'),

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
      rollbar.critical(err, e);
    }
    $('input[type=file]').val('');
    delegate.set("isUploading", false);
  },
});


export default UploadAppComponent;
