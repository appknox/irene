import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import FileQueueService from 'ember-file-upload/services/file-queue';
import { waitForPromise } from '@ember/test-waiters';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import UploadAppService from 'irene/services/upload-app';

export default class UploadAppViaSystemComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare rollbar: any;
  @service('notifications') declare notify: NotificationService;
  @service declare uploadApp: UploadAppService;
  @service declare fileQueue: FileQueueService;

  tErrorWhileFetching: string;
  tErrorWhileUploading: string;
  tFileUploadedSuccessfully: string;

  fileQueueName = 'uploadApp';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.tErrorWhileFetching = this.intl.t('errorWhileFetching');
    this.tErrorWhileUploading = this.intl.t('errorWhileUploading');
    this.tFileUploadedSuccessfully = this.intl.t('fileUploadedSuccessfully');
  }

  handleUploadApp = task(async (file) => {
    const queue = this.fileQueue.find(this.fileQueueName) || null;

    this.uploadApp.openSubsPopover();

    try {
      this.uploadApp.updateSystemFileQueue(queue);

      const uploadItem = await waitForPromise(
        this.store.queryRecord('uploadApp', {})
      );

      await waitForPromise(
        file.uploadBinary(uploadItem.url, {
          method: 'PUT',
          withCredentials: false,
        })
      );

      await waitForPromise(uploadItem.save());

      triggerAnalytics(
        'feature',
        ENV.csb['applicationUpload'] as CsbAnalyticsFeatureData
      );

      this.uploadApp.updateSystemFileQueue(queue);
      this.notify.success(this.tFileUploadedSuccessfully);
    } catch (e) {
      const err = this.tErrorWhileUploading;

      this.notify.error(err);

      this.rollbar.critical(err, e);
      queue?.remove(file); // since queue won't flush for failed uploads

      this.uploadApp.updateSystemFileQueue(queue);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::ViaSystem': typeof UploadAppViaSystemComponent;
  }
}
