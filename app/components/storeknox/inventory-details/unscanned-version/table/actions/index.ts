/* eslint-disable ember/no-observers */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { addObserver, removeObserver } from '@ember/object/observers';
import { tracked } from '@glimmer/tracking';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import parseError from 'irene/utils/parse-error';
import SubmissionModel from 'irene/models/submission';
import RealtimeService from 'irene/services/realtime';
import ENUMS from 'irene/enums';
import SkAppVersionModel from 'irene/models/sk-app-version';

dayjs.extend(advancedFormat);

interface AppMonitoringVersionTableActionsSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class AppMonitoringVersionTableActionsComponent extends Component<AppMonitoringVersionTableActionsSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;

  @tracked relatedVersionSubmissionRecord: SubmissionModel | null = null;
  @tracked showAppUploadState = false;
  @tracked showErrorDetailsModal = false;

  constructor(
    owner: unknown,
    args: AppMonitoringVersionTableActionsSignature['Args']
  ) {
    super(owner, args);

    this.resolveVersionSubmission.perform();
  }

  get skAppVersion() {
    return this.args.skAppVersion;
  }

  get isIOSApp() {
    return (
      this.skAppVersion?.get('skApp')?.get('appMetadata')?.platform ===
      ENUMS.PLATFORM.IOS
    );
  }

  get isScanned() {
    return this.skAppVersion.get('file');
  }

  get submissionStatus() {
    const status = this.relatedVersionSubmissionRecord?.status;

    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED:
        return {
          label: this.intl.t('failed'),
          icon: 'error',
          iconColor: 'error' as const,
          running: false,
          failed: true,
        };

      case ENUMS.SUBMISSION_STATUS.ANALYZING:
        return {
          label: this.intl.t('completed'),
          icon: 'download-done',
          iconColor: 'success' as const,
          running: false,
          failed: false,
        };

      default:
        return {
          label: this.intl.t('inProgress'),
          icon: 'downloading',
          iconColor: 'info' as const,
          running: true,
          failed: false,
        };
    }
  }

  get appIsAnalyzing() {
    return !this.submissionStatus?.running && !this.submissionStatus?.failed;
  }

  get showNoActionText() {
    return !this.showAppUploadState && this.isScanned;
  }

  @action triggerInitiateUpload() {
    this.initiateUpload.perform();
  }

  @action toggleShowErrorDetailsModal() {
    this.showErrorDetailsModal = !this.showErrorDetailsModal;
  }

  @action reloadAmAppVersion() {
    if (this.appIsAnalyzing) {
      this.reloadVersion.perform();
    }
  }

  @action getLastUploadAttemptDate(date?: Date) {
    return dayjs(date).format('Do MMM YYYY');
  }

  retryAppVersionUpload = task(async () => {
    await this.initiateUpload.perform();
    this.toggleShowErrorDetailsModal();
  });

  reloadVersion = task(async () => {
    await this.skAppVersion.reload();
  });

  resolveVersionSubmission = task(async () => {
    const uploadSubmission = this.skAppVersion?.get('uploadSubmission');

    if (uploadSubmission?.get('id')) {
      const relatedVersionSubmissionRecord = await uploadSubmission;
      this.relatedVersionSubmissionRecord = relatedVersionSubmissionRecord;

      if (relatedVersionSubmissionRecord) {
        addObserver(
          this.relatedVersionSubmissionRecord,
          'status',
          this,
          this.reloadAmAppVersion
        );
      }
    }
  });

  initiateUpload = task(async () => {
    if (this.isIOSApp) {
      return;
    }

    try {
      // TODO: APIs not available yet
      // const URL = `${ENV.endpoints['amAppVersions']}/${this.amAppVersion.id}/initiate_upload`;
      // const data = (await this.ajax.post(URL)) as {
      //   id: number;
      //   status: number;
      // };
      // this.relatedVersionSubmissionRecord = await this.store.findRecord(
      //   'submission',
      //   data.id
      // );
      // this.showAppUploadState = true;
      // addObserver(
      //   this.relatedVersionSubmissionRecord,
      //   'status',
      //   this,
      //   this.reloadAmAppVersion
      // );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  willDestroy(): void {
    super.willDestroy();

    if (this.relatedVersionSubmissionRecord) {
      removeObserver(
        this.relatedVersionSubmissionRecord,
        'status',
        this,
        this.reloadAmAppVersion
      );
    }
  }
}
