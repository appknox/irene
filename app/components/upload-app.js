/* eslint-disable prettier/prettier, ember/no-get, ember/no-jquery */
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { t } from 'ember-intl';
import FileField from 'ember-uploader/components/file-field';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import FileUploader from 'irene/utils/uploader';
import $ from 'jquery';

// export default class HomePageComponent extends Component{}

const UploadAppComponent = FileField.extend({
  store: service('store'),
  delegate: null,
  intl: service('intl'),
  rollbar: service('rollbar'),

  tErrorWhileFetching: t('errorWhileFetching'),
  tErrorWhileUploading: t('errorWhileUploading'),
  tFileUploadedSuccessfully: t('fileUploadedSuccessfully'),
  notify: service('notifications'),

  classNames: ['file-input'],
  async filesDidChange(files) {
    const delegate = this.get('delegate');

    if (isEmpty(files)) {
      return;
    }
    // delegate.set('isUploading', true);
    delegate.setAppUploadStatus(true);
    // delegate.set('progress', 0);
    delegate.setAppUploadProgress(0);

    const uploader = FileUploader.create({ container: getOwner(this) });
    uploader.on('progress', (e) =>
      // delegate.set('progress', parseInt(e.percent))
      delegate.setAppUploadProgress(parseInt(e.percent))
    );
    try {
      const uploadItem = await this.get('store').queryRecord('uploadApp', {});
      await uploader.uploadFile(files[0], uploadItem.get('url'));
      await uploadItem.save();
      triggerAnalytics('feature', ENV.csb.applicationUpload);
      this.get('notify').success(this.get('tFileUploadedSuccessfully'));
    } catch (e) {
      // eslint-disable-next-line no-console
      const err = this.get('tErrorWhileUploading');
      this.get('notify').error(err);
      this.get('rollbar').critical(err, e);
    }
    $('input[type=file]').val('');
    delegate.setAppUploadStatus(false);
    // delegate.set('isUploading', false);
  },
});

export default UploadAppComponent;
