import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';
import { BufferedChangeset } from 'ember-changeset/types';
import { validatePresence } from 'ember-changeset-validations/validators';
import { waitForPromise } from '@ember/test-waiters';

import parseError from 'irene/utils/parse-error';
import { validateStoreDomain, validateStorePathname } from './validator';
import type AnalyticsService from 'irene/services/analytics';
import type UploadAppService from 'irene/services/upload-app';
import type UploadAppUrlModel from 'irene/models/upload-app-url';

type ChangesetBufferProps = BufferedChangeset & {
  url: string;
};

const StoreUrlValidator = {
  url: [validatePresence(true), validateStoreDomain(), validateStorePathname()],
};

export default class UploadAppViaLinkComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare uploadApp: UploadAppService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked showLinkUploadModal = false;
  @tracked changeset: ChangesetBufferProps | null = null;

  model = {};

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.changeset = Changeset(
      this.model,
      lookupValidator(StoreUrlValidator),
      StoreUrlValidator
    ) as ChangesetBufferProps;
  }

  @action
  openLinkUploadModal() {
    this.showLinkUploadModal = true;
  }

  @action
  closeLinkUploadModal() {
    this.showLinkUploadModal = false;
    this.changeset?.rollback?.();
  }

  uploadAppViaLink = task(async () => {
    await waitForPromise((this.changeset as ChangesetBufferProps).validate?.());

    if (!this.changeset?.isValid) {
      return;
    }

    try {
      const uploadAppUrl = this.store.createRecord('uploadAppUrl', {
        url: this.changeset.url,
      });

      const uploadedApp = (await waitForPromise(
        uploadAppUrl.save()
      )) as UploadAppUrlModel;

      this.uploadApp.submissionSet.add(uploadedApp.id);

      this.analytics.track({
        name: 'UPLOAD_APP_EVENT',
        properties: {
          feature: 'file_upload_via_link',
          fileId: uploadedApp.id,
          fileUrl: uploadedApp.url,
        },
      });

      this.closeLinkUploadModal();
      this.uploadApp.openSubsPopover();
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
      }

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::ViaLink': typeof UploadAppViaLinkComponent;
  }
}
