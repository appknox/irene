/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { waitForPromise } from '@ember/test-waiters';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import RealtimeService from 'irene/services/realtime';
import SubmissionModel from 'irene/models/submission';
import UploadAppService from 'irene/services/upload-app';

dayjs.extend(relativeTime);

type SystemFileMetaData = {
  file: {
    progress: number;
  };
  statusHumanized: string;
};

const failedSubmissionStatus = [
  ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
];

export default class UploadAppStatusComponent extends Component {
  @tracked showDropdown = false;
  @tracked anchorRef?: HTMLElement | null;
  @tracked submissions: DS.AdapterPopulatedRecordArray<SubmissionModel> | null =
    null;
  @tracked submissionSet = new Set<string>();

  @service declare store: Store;
  @service declare realtime: RealtimeService;
  @service declare uploadApp: UploadAppService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.initialize();
  }

  willDestroy() {
    super.willDestroy();

    this.removeSubmissionCounterObserver();
  }

  get submissionList() {
    return this.submissions?.toArray() || [];
  }

  get submissionNumbers() {
    const obj = {
      completed: 0,
      failed: 0,
      running: 0,
    };

    this.submissions?.forEach((submission) => {
      if (
        submission.status === ENUMS.SUBMISSION_STATUS.ANALYZING &&
        this.submissionSet.has(submission.id)
      ) {
        obj.completed = obj.completed + 1;
      } else if (failedSubmissionStatus.includes(submission.status)) {
        obj.failed = obj.failed + 1;
      } else {
        if (submission.status != ENUMS.SUBMISSION_STATUS.ANALYZING) {
          obj.running = obj.running + 1;
        }
      }
    });

    if ((this.systemFileQueue?.files?.length || 0) > 0) {
      obj.running = obj.running + (this.systemFileQueue?.files?.length || 0);
    }

    return obj;
  }

  get loaderVariant() {
    return this.submissionNumbers.running > 0 ? 'indeterminate' : 'determinate';
  }

  get loaderColorClass() {
    return this.submissionNumbers.failed > 0 ? '' : 'green-loader';
  }

  get systemFileQueue() {
    return this.uploadApp.systemFileQueue;
  }

  get statusNumbers() {
    return [
      {
        appStatus: 'running',
        iconName: 'downloading',
        iconColor: 'info' as const,
        value: String(this.submissionNumbers.running).padStart(2, '0'),
      },
      {
        appStatus: 'completed',
        iconName: 'download-done',
        iconColor: 'success' as const,
        value: String(this.submissionNumbers.completed).padStart(2, '0'),
      },
      {
        appStatus: 'failed',
        iconName: 'error',
        iconColor: 'error' as const,
        value: String(this.submissionNumbers.failed).padStart(2, '0'),
      },
    ];
  }

  @action
  registerAnchorRef(event: Event) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  registerAnchorRefOnInsert(element: HTMLElement) {
    this.anchorRef = element;
  }

  @action
  closeSubmissionStatus() {
    this.anchorRef = null;
  }

  get sortedSubmissions() {
    const sortedSubmissions = [...this.submissionList];

    sortedSubmissions.sort((a, b) =>
      dayjs(b.createdOn).diff(dayjs(a.createdOn))
    );

    return sortedSubmissions;
  }

  get computedSubmissionList() {
    const failed: SubmissionModel[] = [];
    const uploading: SystemFileMetaData[] = [];
    const completed: SubmissionModel[] = [];
    const running: SubmissionModel[] = [];

    (this.systemFileQueue?.files || []).forEach((file) => {
      uploading.push({
        file,
        statusHumanized: this.intl.t('uploading'),
      });
    });

    this.sortedSubmissions.forEach((submission) => {
      if (
        submission.status === ENUMS.SUBMISSION_STATUS.ANALYZING &&
        this.submissionSet.has(submission.id)
      ) {
        completed.push(submission);
      } else if (failedSubmissionStatus.includes(submission.status)) {
        failed.push(submission);
      } else {
        if (submission.status != ENUMS.SUBMISSION_STATUS.ANALYZING) {
          running.push(submission);
        }
      }
    });

    return [...failed, ...uploading, ...running, ...completed];
  }

  get hasSubmissions() {
    return this.computedSubmissionList.length > 0;
  }

  @action initialize() {
    addObserver(
      this.realtime,
      'SubmissionCounter',
      this,
      this.observeSubmissionCounter
    );

    this.getSubmissions.perform();
  }

  @action removeSubmissionCounterObserver() {
    removeObserver(
      this.realtime,
      'SubmissionCounter',
      this,
      this.observeSubmissionCounter
    );
  }

  @action
  observeSubmissionCounter() {
    this.getSubmissions.perform();
  }

  getSubmissions = task(async () => {
    try {
      await waitForPromise(
        this.store.query('submission', {
          status: ENUMS.SUBMISSION_STATUS.VALIDATING,
        })
      );

      this.submissions = this.store.peekAll('submission');
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::Status': typeof UploadAppStatusComponent;
  }
}
