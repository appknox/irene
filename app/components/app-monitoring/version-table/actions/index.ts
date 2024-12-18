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

import AmAppVersionModel from 'irene/models/am-app-version';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import SubmissionModel from 'irene/models/submission';
import RealtimeService from 'irene/services/realtime';
import ENUMS from 'irene/enums';
import type IreneAjaxService from 'irene/services/ajax';

dayjs.extend(advancedFormat);

interface AppMonitoringVersionTableActionsSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringVersionTableActionsComponent extends Component<AppMonitoringVersionTableActionsSignature> {
  @service declare ajax: IreneAjaxService;
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

  get amAppVersion() {
    return this.args.amAppVersion;
  }

  get isIOSApp() {
    return (
      this.amAppVersion.get('amApp')?.get('project')?.get('platform') ===
      ENUMS.PLATFORM.IOS
    );
  }

  get isScanned() {
    return this.amAppVersion.get('latestFile').get('id');
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
    await this.amAppVersion.reload();
  });

  resolveVersionSubmission = task(async () => {
    if (this.amAppVersion.get('uploadSubmission').get('id')) {
      this.relatedVersionSubmissionRecord =
        await this.amAppVersion.get('uploadSubmission');

      addObserver(
        this.relatedVersionSubmissionRecord,
        'status',
        this,
        this.reloadAmAppVersion
      );
    }
  });

  initiateUpload = task(async () => {
    if (this.isIOSApp) {
      return;
    }

    try {
      const URL = `${ENV.endpoints['amAppVersions']}/${this.amAppVersion.id}/initiate_upload`;
      const data = (await this.ajax.post(URL)) as {
        id: number;
        status: number;
      };

      this.relatedVersionSubmissionRecord = await this.store.findRecord(
        'submission',
        data.id
      );

      this.showAppUploadState = true;

      addObserver(
        this.relatedVersionSubmissionRecord,
        'status',
        this,
        this.reloadAmAppVersion
      );
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
