import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type FileQueueService from 'ember-file-upload/services/file-queue';
import type { UploadFile } from 'ember-file-upload';

import type AnalyticsService from 'irene/services/analytics';
import type UploadAppService from 'irene/services/upload-app';
import type UploadAppModel from 'irene/models/upload-app';

export default class UploadAppViaSystemComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare uploadApp: UploadAppService;
  @service declare fileQueue: FileQueueService;
  @service declare analytics: AnalyticsService;

  tErrorWhileFetching: string;
  tErrorWhileUploading: string;
  tFileUploadedSuccessfully: string;

  fileQueueName = 'uploadApp';
  allowedExtensions = ['apk', 'aab', 'ipa'];

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.tErrorWhileFetching = this.intl.t('errorWhileFetching');
    this.tErrorWhileUploading = this.intl.t('errorWhileUploading');
    this.tFileUploadedSuccessfully = this.intl.t('fileUploadedSuccessfully');
  }

  @action validateFile(file: UploadFile) {
    const fileName = file.name.toLowerCase();
    const ext = fileName.split('.').pop();

    if (!ext || !this.allowedExtensions.includes(ext)) {
      this.notify.error(this.intl.t('invalidFileType'));

      return false;
    }

    return true;
  }

  @action
  onFileAdded(file: UploadFile) {
    if (!this.validateFile(file)) {
      const queue = this.fileQueue.find(this.fileQueueName);

      queue?.remove(file);
      return;
    }

    this.handleUploadApp.perform(file);
  }

  handleUploadApp = task(async (file) => {
    const queue = this.fileQueue.find(this.fileQueueName) || null;

    this.uploadApp.openSubsPopover();

    try {
      this.uploadApp.updateSystemFileQueue(queue);

      const uploadItem = (await waitForPromise(
        this.store.queryRecord('upload-app', {})
      )) as UploadAppModel;

      await waitForPromise(
        file.uploadBinary(uploadItem.url, {
          method: 'PUT',
          withCredentials: false,
        })
      );

      await waitForPromise(uploadItem.save());

      this.analytics.track({
        name: 'UPLOAD_APP_EVENT',
        properties: {
          feature: 'file_upload_via_system',
          fileKey: uploadItem.fileKey,
          fileUrl: uploadItem.url,
          fileKeySigned: uploadItem.fileKeySigned,
        },
      });

      this.uploadApp.updateSystemFileQueue(queue);
      this.notify.success(this.tFileUploadedSuccessfully);
    } catch (e) {
      const error = e as AdapterError;
      const firstErr = error.errors?.[0];
      const errorDetail = firstErr?.detail;
      const errorStatus = Number(firstErr?.status);

      if (errorStatus === 429 && errorDetail) {
        // Extract error detail message containing retry time
        const parsed = JSON.parse(errorDetail);
        const lockTime = parsed.lock_time;

        this.uploadApp.showAndStartRateLimitErrorCountdown(lockTime);
      } else {
        this.notify.error(this.tErrorWhileUploading);
      }

      queue?.remove(file); // since queue won't flush for failed uploads
      this.uploadApp.updateSystemFileQueue(queue);

      this.analytics.trackError(e, {
        screen: 'upload_app_via_system',
        feature: 'file_upload_via_system_flow',
      });
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::ViaSystem': typeof UploadAppViaSystemComponent;
  }
}
