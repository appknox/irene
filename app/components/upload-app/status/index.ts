/* eslint-disable ember/no-observers */
/* eslint-disable ember/use-ember-data-rfc-395-imports */
import DS from 'ember-data';
import { tracked } from 'tracked-built-ins';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Store from 'ember-data/store';
import { inject as service } from '@ember/service';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import RealtimeService from 'irene/services/realtime';
import UploadAppService from 'irene/services/upload-app';
import SubmissionModel from 'irene/models/submission';

dayjs.extend(relativeTime);

type SystemFileMetaData = {
  file: {
    progress: number;
  };
  statusHumanized: string;
};

export type SubmissionModelWithSystemFileData = SubmissionModel &
  SystemFileMetaData['file'];

const failedSubmissionStatus = [
  ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
];

export default class UploadAppStatusComponent extends Component {
  @service declare store: Store;
  @service declare realtime: RealtimeService;
  @service declare uploadApp: UploadAppService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked submissions: DS.AdapterPopulatedRecordArray<SubmissionModel> | null =
    null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.initialize();
  }

  willDestroy() {
    super.willDestroy();

    this.removeSubmissionCounterObserver();
  }

  get submissionList() {
    return this.submissions?.slice() || [];
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
        this.uploadApp.submissionSet.has(submission.id)
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

    if ((this.uploadApp.systemFileQueue?.files?.length || 0) > 0) {
      obj.running =
        obj.running + (this.uploadApp.systemFileQueue?.files?.length || 0);
    }

    return obj;
  }

  get statusNumbers() {
    return [
      {
        appStatus: 'running',
        iconName: 'downloading' as const,
        iconColor: 'info' as const,
        value: String(this.submissionNumbers.running).padStart(2, '0'),
      },
      {
        appStatus: 'completed',
        iconName: 'download-done' as const,
        iconColor: 'success' as const,
        value: String(this.submissionNumbers.completed).padStart(2, '0'),
      },
      {
        appStatus: 'failed',
        iconName: 'error' as const,
        iconColor: 'error' as const,
        value: String(this.submissionNumbers.failed).padStart(2, '0'),
      },
    ];
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

    (this.uploadApp.systemFileQueue?.files || []).forEach((file) => {
      uploading.push({
        file,
        statusHumanized: this.intl.t('uploading'),
      });
    });

    this.sortedSubmissions.forEach((submission) => {
      if (
        submission.status === ENUMS.SUBMISSION_STATUS.ANALYZING &&
        this.uploadApp.submissionSet.has(submission.id)
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

    return [
      ...failed,
      ...uploading,
      ...running,
      ...completed,
    ] as SubmissionModelWithSystemFileData[];
  }

  get hasSubmissions() {
    return this.computedSubmissionList.length > 0;
  }

  get loaderVariant() {
    return this.submissionNumbers.running > 0 ? 'indeterminate' : 'determinate';
  }

  get loaderColorClass() {
    return this.submissionNumbers.failed > 0 ? '' : 'green-loader';
  }

  @action
  registerAnchorRefOnInsert(element: HTMLElement) {
    this.uploadApp.updateSubsPopoverAnchorRef(element);
  }

  @action
  openSubmissionsPopover(event: Event) {
    this.uploadApp.openSubsPopover(event.currentTarget as HTMLElement);
  }

  @action
  closeSubmissionsPopover() {
    this.uploadApp.closeSubsPopover();
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
      const validatingSubs = await waitForPromise(
        this.store.query('submission', {
          status: ENUMS.SUBMISSION_STATUS.VALIDATING,
        })
      );

      // Add new submissions to submission set once the client receives them
      // To persist submissions in the popover even if the popover is not opened
      validatingSubs.forEach((sub) => this.uploadApp.submissionSet.add(sub.id));

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
