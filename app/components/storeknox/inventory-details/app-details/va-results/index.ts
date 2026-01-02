/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import { addObserver, removeObserver } from '@ember/object/observers';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SubmissionModel from 'irene/models/submission';
import type FileModel from 'irene/models/file';

interface StoreknoxInventoryDetailsAppDetailsVaResultsSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked submission?: SubmissionModel | null = null;
  @tracked coreProjectLatestVersion?: FileModel | null = null;
  @tracked coreProjectLatestVersionInaccessible = false;
  @tracked userCanAccessSubmission = false;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsAppDetailsVaResultsSignature['Args']
  ) {
    super(owner, args);

    this.fetchCoreProjectLatestVersion.perform();
    this.resolveSkAppSubmission.perform();
  }

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get submissionProgress() {
    return Number(this.submission?.progress);
  }

  get appUploadIsProcessing() {
    return this.submissionProgress < 100;
  }

  get uploadCompleted() {
    return this.submissionProgress === 100;
  }

  get uploadNotStarted() {
    return (
      this.submission?.status === ENUMS.SUBMISSION_STATUS.STORE_NOT_STARTED
    );
  }

  get tCannotInitiateUpload() {
    return this.intl.t('storeknox.initiateUploadMessages.cannotIntiateUpload');
  }

  get showUploadProgressState() {
    return (
      this.uploadNotStarted ||
      this.appUploadIsProcessing ||
      this.uploadCompleted
    );
  }

  get loadingVaData() {
    return (
      this.fetchCoreProjectLatestVersion?.isRunning ||
      this.resolveSkAppSubmission.isRunning
    );
  }

  @action trackSubmissionStatusChange() {
    addObserver(
      this.submission as SubmissionModel,
      'status',
      this,
      this.reloadSkInventoryApp
    );
  }

  @action initiateAppUpload() {
    if (this.skInventoryApp?.isArchived || this.skInventoryApp?.isIos) {
      this.notify.error(this.tCannotInitiateUpload);

      return;
    }

    this.doInitiateAppUpload.perform();
  }

  async reloadSkInventoryApp() {
    const skInventoryApp = await this.skInventoryApp?.reload();

    await this.fetchCoreProjectLatestVersion.perform();

    return skInventoryApp;
  }

  doInitiateAppUpload = task(async () => {
    try {
      // Reload necessary in scenarios when another user has already started an upload
      // but current user UI is still showing upload UI
      const skInventoryApp = await this.reloadSkInventoryApp();

      if (skInventoryApp?.canInitiateUpload) {
        const res = await this.skInventoryApp?.initiateAppUpload();
        const subId = Number(res?.id);

        const submission = await this.store.findRecord('submission', subId);

        this.submission = submission;
        this.userCanAccessSubmission = true;

        await this.reloadSkInventoryApp();

        // Listen for submission changes after a successful upload to update UI accordingly
        this.trackSubmissionStatusChange();

        return;
      }

      // Reload submissions if another user has already initiated a reupload
      this.resolveSkAppSubmission.perform();
      this.notify.error(this.tCannotInitiateUpload);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  resolveSkAppSubmission = task(async () => {
    const submission = this.skInventoryApp?.uploadSubmission;
    const subId = submission?.get('id');

    if (!subId) {
      return;
    }

    try {
      this.submission = await submission;
      this.userCanAccessSubmission = true;

      this.trackSubmissionStatusChange();
    } catch (error) {
      const err = error as AdapterError;
      const userCannotAccessSubmission = err.errors?.[0]?.status === '404';

      // If submission ID exists in SkApp but user does not have access to it.
      this.userCanAccessSubmission = !userCannotAccessSubmission;
    }
  });

  // Refetching file is necessary order to know if user has file access or not (from error status)
  fetchCoreProjectLatestVersion = task(async () => {
    try {
      this.coreProjectLatestVersion =
        await this.skInventoryApp?.coreProjectLatestVersion;
    } catch (err) {
      this.coreProjectLatestVersionInaccessible =
        (err as AdapterError)?.errors?.[0]?.status === '404';
    }
  });

  willDestroy(): void {
    super.willDestroy();

    if (this.submission) {
      removeObserver(
        this.submission as SubmissionModel,
        'status',
        this,
        this.reloadSkInventoryApp
      );
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsComponent;
  }
}
