/* eslint-disable prettier/prettier, ember/no-get, ember/no-jquery */
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import FileUploader from 'irene/utils/uploader';
import FileField from 'ember-uploader/components/file-field';
import { t } from 'ember-intl';
import $ from 'jquery';
import { getOwner } from '@ember/application';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';

const UploadAppComponent = FileField.extend({
  store: service('store'),
  delegate: null,
  intl: service('intl'),
  rollbar: service('rollbar'),


  tErrorWhileFetching: t("errorWhileFetching"),
  tErrorWhileUploading: t("errorWhileUploading"),
  tFileUploadedSuccessfully: t("fileUploadedSuccessfully"),
  notify: service("notifications"),

  classNames: ["file-input"],
  async filesDidChange(files) {
    const delegate = this.get("delegate");
    if (isEmpty(files)) {
      return;
    }
    delegate.set("isUploading", true);
    delegate.set("progress", 0);
    const uploader = FileUploader.create({ container: getOwner(this) });
    uploader.on('progress', e => delegate.set("progress", parseInt(e.percent)));
    try {
      const uploadItem = await this.get("store").queryRecord('uploadApp', {});
      await uploader.uploadFile(files[0], uploadItem.get('url'));
      await uploadItem.save();
      triggerAnalytics('feature',ENV.csb.applicationUpload);
      this.get("notify").success(this.get('tFileUploadedSuccessfully'));
    } catch (e) {
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
