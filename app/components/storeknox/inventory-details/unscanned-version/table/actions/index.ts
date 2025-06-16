/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { addObserver, removeObserver } from '@ember/object/observers';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type SubmissionModel from 'irene/models/submission';
import type SkAppVersionModel from 'irene/models/sk-app-version';
import type IreneAjaxService from 'irene/services/ajax';
import type MeService from 'irene/services/me';
import type FileModel from 'irene/models/file';

dayjs.extend(advancedFormat);

interface StoreknoxInventoryDetailsUnscannedVersionTableActionsSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
    isLoadingTableData: boolean;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableActionsComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableActionsSignature> {
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @tracked submission?: SubmissionModel | null = null;
  @tracked skAppVersionFile?: FileModel | null = null;
  @tracked showAppUploadState = false;
  @tracked showUploadInfoModal = false;
  @tracked versionFileIsAccessibleToUser = false;
  @tracked userCanAccessSubmission = false;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsUnscannedVersionTableActionsSignature['Args']
  ) {
    super(owner, args);

    this.fetchSkAppVersionFile.perform();
    this.resolveVersionSubmission.perform();
  }

  get skAppVersion() {
    return this.args.skAppVersion;
  }

  get isLoadingNecessaryData() {
    return (
      this.resolveVersionSubmission.isRunning ||
      this.fetchSkAppVersionFile.isRunning
    );
  }

  get skApp() {
    return this.skAppVersion?.get('skApp');
  }

  get isOwner() {
    return !!this.me.org?.is_owner;
  }

  get submissionErrorMsg() {
    return this.skAppVersion?.submissionErrorMessage;
  }

  get canInitiateUpload() {
    return this.skAppVersion?.canInitiateUpload;
  }

  get submissionStatus() {
    return this.submission?.status;
  }

  get submissionStatusIsFailed() {
    return [
      ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
    ].includes(Number(this.submissionStatus));
  }

  get uploadIsInProgressForNonInitiator() {
    return !this.userCanAccessSubmission && !this.canInitiateUpload;
  }

  // If upload has already been initiated and failed
  get uploadIncomplete() {
    return (
      (this.userCanAccessSubmission && this.submissionStatusIsFailed) ||
      this.uploadIsInProgressForNonInitiator
    );
  }

  get fileIsBeingAnalyzed() {
    return (
      this.userCanAccessSubmission &&
      this.submissionStatus === ENUMS.SUBMISSION_STATUS.ANALYZING
    );
  }

  get showUploadCompletedIllustration() {
    return (
      this.userCanAccessSubmission &&
      this.fileIsBeingAnalyzed &&
      // Only show completed UI when user stays on page after a successful upload.
      // After a refresh, the "No Action Required Text" should be displayed. This ensures that.
      this.showUploadedAppCurrentStatus
    );
  }

  get uploadHeaderMsg() {
    if (this.userCanAccessSubmission) {
      if (this.fileIsBeingAnalyzed) {
        return this.intl.t('storeknox.initiateUploadMessages.uploadCompleted');
      }

      if (this.uploadIncomplete) {
        return this.intl.t('storeknox.initiateUploadMessages.uploadIncomplete');
      }

      if (!this.canInitiateUpload && this.isOwner) {
        return this.intl.t(
          'storeknox.initiateUploadMessages.uploadPendingCompletion'
        );
      }
    } else {
      if (this.canInitiateUpload) {
        return this.intl.t('storeknox.appNotInAppknoxHeader');
      }

      if (!this.canInitiateUpload && this.isOwner) {
        return this.intl.t(
          'storeknox.initiateUploadMessages.uploadPendingCompletion'
        );
      }
    }

    return this.intl.t(
      'storeknox.initiateUploadMessages.uploadInitiatedHeader'
    );
  }

  get uploadSubTextMsg() {
    if (this.userCanAccessSubmission) {
      if (this.fileIsBeingAnalyzed) {
        return this.intl.t(
          'storeknox.initiateUploadMessages.fileBeingAnalyzedMsg'
        );
      }

      if (this.uploadIncomplete) {
        return this.submission?.reason;
      }
    }

    if (!this.userCanAccessSubmission && this.canInitiateUpload) {
      return this.intl.t('storeknox.appNotInAppknoxDescription');
    }

    return this.submissionErrorMsg
      ? htmlSafe(this.submissionErrorMsg)
      : this.intl.t('storeknox.initiateUploadMessages.uploadInitiatedDesc');
  }

  get isScanned() {
    return this.skAppVersion.file.get('id') !== null;
  }

  get submissionStatusProps() {
    if (this.submissionStatusIsFailed) {
      return {
        running: false,
        failed: true,
      };
    }

    if (this.submissionStatus === ENUMS.SUBMISSION_STATUS.ANALYZING) {
      return {
        running: false,
        failed: false,
      };
    }

    return {
      running: true,
      failed: false,
    };
  }

  get appIsAnalyzing() {
    return (
      !this.submissionStatusProps?.running &&
      !this.submissionStatusProps?.failed
    );
  }

  get showNoActionText() {
    return !this.showAppUploadState && this.isScanned;
  }

  get showUploadedAppCurrentStatus() {
    return (
      (!this.userCanAccessSubmission && !this.canInitiateUpload) ||
      (this.userCanAccessSubmission && this.submission) ||
      this.showAppUploadState
    );
  }

  get lastUploadAttemptDate() {
    return dayjs(this.submission?.createdOn).format('Do MMM YYYY');
  }

  @action triggerInitiateUpload() {
    this.initiateUpload.perform();
  }

  @action toggleShowUploadInfoModal() {
    this.showUploadInfoModal = !this.showUploadInfoModal;
  }

  @action closeUploadInfoModalIfOpen() {
    if (this.showUploadInfoModal) {
      this.toggleShowUploadInfoModal();
    }
  }

  @action reloadSkAppVersion() {
    this.closeUploadInfoModalIfOpen();

    if (this.appIsAnalyzing) {
      this.doReloadSkAppVersion.perform();
    }
  }

  @action retryAppVersionUpload() {
    this.initiateUpload.perform();
  }

  doReloadSkAppVersion = task(async () => {
    await this.skAppVersion.reload();
    await (await this.skAppVersion.get('skApp')).reload();
  });

  @action trackSubmissionStatusChange() {
    addObserver(
      this.submission as SubmissionModel,
      'status',
      this,
      this.reloadSkAppVersion
    );
  }

  initiateUpload = task(async () => {
    try {
      const skAppVersion = await this.skAppVersion.reload();

      if (skAppVersion.canInitiateUpload) {
        const data = await this.skAppVersion?.initiateAppUpload();

        this.submission = await this.store.findRecord('submission', data.id);

        this.userCanAccessSubmission = true;
        this.showAppUploadState = true;

        this.trackSubmissionStatusChange();
        this.closeUploadInfoModalIfOpen();

        return;
      }

      // Reload submissions if another user has already initiated a reupload
      this.resolveVersionSubmission.perform();

      this.toggleShowUploadInfoModal();

      this.notify.error(
        this.intl.t(
          'storeknox.initiateUploadMessages.cannotIntiateUploadForVersion'
        )
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  resolveVersionSubmission = task(async () => {
    const submission = this.skAppVersion?.uploadSubmission;
    const subId = submission?.get('id');

    if (subId === null) {
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

  // it is necessary to refetch file in order to know if user has file access or not
  fetchSkAppVersionFile = task(async () => {
    try {
      this.skAppVersionFile = await this.skAppVersion?.file;
      this.versionFileIsAccessibleToUser = true;
    } catch (error) {
      const err = error as AdapterError;
      const userCannotAccessVersionFile = err.errors?.[0]?.status === '404';

      this.versionFileIsAccessibleToUser = !userCannotAccessVersionFile;
    }
  });

  willDestroy(): void {
    super.willDestroy();

    if (this.submission) {
      removeObserver(this.submission, 'status', this, this.reloadSkAppVersion);
    }
  }
}
