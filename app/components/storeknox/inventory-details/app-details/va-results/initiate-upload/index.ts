import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SubmissionModel from 'irene/models/submission';
import type MeService from 'irene/services/me';

interface StoreknoxInventoryDetailsAppDetailsVaResultsSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
    submission?: SubmissionModel | null;
    userCanAccessSubmission: boolean;
    initiateUploadIsInProgress: boolean;
    initiateAppUpload(): void;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsInitiateUploadComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get isOwner() {
    return !!this.me.org?.is_owner;
  }

  get submission() {
    return this.args.submission;
  }

  get submissionErrorMsg() {
    return this.skInventoryApp?.submissionErrorMessage;
  }

  get canInitiateUpload() {
    return this.skInventoryApp?.canInitiateUpload;
  }

  get userCanAccessSubmission() {
    return this.args.userCanAccessSubmission;
  }

  get submissionStatusIsErrored() {
    return [
      ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
    ].includes(Number(this.submission?.status));
  }

  get uploadFailed() {
    return this.userCanAccessSubmission && this.submissionStatusIsErrored;
  }

  get fileIsBeingAnalyzed() {
    return (
      this.userCanAccessSubmission &&
      ENUMS.SUBMISSION_STATUS.ANALYZING === this.submission?.status
    );
  }

  get uploadIsInProgressForNonInitiator() {
    return !this.userCanAccessSubmission && !this.canInitiateUpload;
  }

  get showNamespacesLink() {
    return (
      this.isOwner &&
      this.uploadIsInProgressForNonInitiator &&
      // If an approval happens the availability changes immediately. However, the core project latest version does not get propagated immediately
      !this.skInventoryApp?.availability?.appknox
    );
  }

  get showUploadCompletedIllustration() {
    return this.userCanAccessSubmission && this.fileIsBeingAnalyzed;
  }

  get uploadHeaderMsg() {
    if (this.userCanAccessSubmission) {
      if (this.fileIsBeingAnalyzed) {
        return this.intl.t('storeknox.initiateUploadMessages.uploadCompleted');
      }

      if (this.uploadFailed) {
        return this.intl.t('storeknox.initiateUploadMessages.uploadFailed');
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

      if (this.uploadFailed) {
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

  get disableInitiateUploadBtn() {
    return (
      this.args.initiateUploadIsInProgress || this.skInventoryApp?.isArchived
    );
  }

  get hideTooltipMessage() {
    return !this.skInventoryApp?.isArchived;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::InitiateUpload': typeof StoreknoxInventoryDetailsAppDetailsVaResultsInitiateUploadComponent;
  }
}
