import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type FileModel from 'irene/models/file';
import type SubmissionModel from 'irene/models/submission';

interface StoreknoxInventoryDetailsAppDetailsVaResultsSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsSignature> {
  @service('notifications') declare notify: NotificationService;

  @tracked coreProjectLatestVersion: FileModel | null | undefined = null;
  @tracked submission: SubmissionModel | null | undefined = null;
  @tracked fileNotAccessibleToUser = false;

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

  // If upload has already been initiated and failed
  get uploadSubmissionFailed() {
    return [
      ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
    ].includes(Number(this.submission?.status));
  }

  get appUploadIsProcessing() {
    return Number(this.submission?.progress) < 100;
  }

  get uploadCompleted() {
    return Number(this.submission?.progress) === 100;
  }

  get loadingVaData() {
    return (
      this.fetchCoreProjectLatestVersion.isRunning ||
      this.resolveSkAppSubmission.isRunning
    );
  }

  @action updateSubmissionModel(submission: SubmissionModel) {
    this.submission = submission;
  }

  resolveSkAppSubmission = task(async () => {
    try {
      this.submission = await this.skInventoryApp?.uploadSubmission;
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  fetchCoreProjectLatestVersion = task(async () => {
    try {
      this.coreProjectLatestVersion =
        await this.skInventoryApp?.coreProjectLatestVersion;
    } catch (err) {
      const error = err as AdapterError;

      if (error?.errors?.[0]?.status === '404') {
        this.fileNotAccessibleToUser = true;
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsComponent;
  }
}
