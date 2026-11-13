import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task, timeout } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type IntlService from 'ember-intl/services/intl';
import type RealtimeService from 'irene/services/realtime';
import type FileQueueService from 'ember-file-upload/services/file-queue';
import type { UploadFile } from 'ember-file-upload';
import type UploadAppModel from 'irene/models/upload-app';
import type OffsecNewAssessmentService from 'irene/services/offsec-new-assessment';
import type { NewAssessmentStepState } from './step';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const ALLOWED_EXTENSIONS = ['apk', 'ipa', 'aab'];
const STARTED_SCAN_POLL_INTERVAL_MS = 3000;
const STARTED_SCAN_POLL_MAX_ATTEMPTS = 100;

/** The upload promise from ember-file-upload is cancelable at runtime. */
type UploadRequest = Promise<unknown> & { abort?: () => unknown };

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);

  return `${size} ${units[i]}`;
}

export default class OffensiveSecurityNewAssessmentComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;
  @service declare realtime: RealtimeService;
  @service declare fileQueue: FileQueueService;
  @service declare offsecNewAssessment: OffsecNewAssessmentService;

  @tracked isUploading = false;
  @tracked uploadProgress = 0;
  @tracked currentFile: UploadFile | null = null;
  @tracked isStartingAssessment = false;
  @tracked showLeaveConfirm = false;

  pendingTransition: Transition | null = null;
  isLeaveConfirmed = false;
  uploadRequest: UploadRequest | null = null;

  fileQueueName = 'offsecAssessmentUpload';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.router.on('routeWillChange', this.handleRouteWillChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  willDestroy() {
    super.willDestroy();

    this.router.off('routeWillChange', this.handleRouteWillChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  get progress(): number {
    const queue = this.fileQueue.find(this.fileQueueName);
    const prog =
      this.currentFile?.progress ?? queue?.progress ?? this.uploadProgress ?? 0;

    return Math.min(100, Math.max(0, Math.round(prog)));
  }

  get isUploadComplete(): boolean {
    return this.isUploading && this.progress >= 100;
  }

  get ringCircumference(): number {
    return 2 * Math.PI * 40;
  }

  get ringDashOffset(): number {
    return this.ringCircumference * (1 - Math.min(this.progress, 100) / 100);
  }

  get hasUploadedApp(): boolean {
    return Boolean(
      this.offsecNewAssessment.uploadedFile &&
      this.offsecNewAssessment.uploadItem
    );
  }

  get uploadedFile() {
    return this.offsecNewAssessment.uploadedFile;
  }

  get formattedFileSize(): string {
    return formatFileSize(this.uploadedFile?.size);
  }

  get hasValidCredentials(): boolean {
    return this.offsecNewAssessment.completeCredentials.length > 0;
  }

  get isIosBuild(): boolean {
    return /\.ipa$/i.test(this.uploadedFile?.name ?? '');
  }

  get uploadStepState(): NewAssessmentStepState {
    return this.hasUploadedApp ? 'done' : 'current';
  }

  get typeStepState(): NewAssessmentStepState {
    return this.hasUploadedApp ? 'done' : 'upcoming';
  }

  get credentialsStepState(): NewAssessmentStepState {
    if (!this.hasUploadedApp) {
      return 'upcoming';
    }

    if (this.offsecNewAssessment.hasIncompleteCredential) {
      return 'current';
    }

    return this.hasValidCredentials ? 'done' : 'upcoming';
  }

  get isBeginDisabled(): boolean {
    if (this.isStartingAssessment) {
      return true;
    }

    if (!this.hasUploadedApp) {
      return true;
    }

    return this.offsecNewAssessment.hasIncompleteCredential;
  }

  get beginCtaLabel(): string {
    return this.intl.t('offensiveSecurity.beginAssessment');
  }

  /** Holds navigation while a build is uploading and asks the user first. */
  handleRouteWillChange = (transition: Transition) => {
    if (!this.isUploading || this.isLeaveConfirmed) {
      return;
    }

    transition.abort();
    this.pendingTransition = transition;
    this.showLeaveConfirm = true;
  };

  handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (this.isUploading) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  @action
  stayOnPage() {
    this.showLeaveConfirm = false;
    this.pendingTransition = null;
  }

  @action
  leaveAndCancelUpload() {
    const transition = this.pendingTransition;

    this.isLeaveConfirmed = true;
    this.showLeaveConfirm = false;
    this.pendingTransition = null;
    this.uploadRequest?.abort?.();

    transition?.retry();
  }

  @action
  changeBuild() {
    this.offsecNewAssessment.clearUploadedApp();
  }

  @action
  validateFile(file: UploadFile): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      this.notify.error(this.intl.t('invalidFileType'));

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.notify.error(this.intl.t('offensiveSecurity.maxFileSizeExceeded'));

      return false;
    }

    return true;
  }

  @action
  async onFileAdded(file: UploadFile) {
    if (!this.validateFile(file)) {
      const queue = this.fileQueue.find(this.fileQueueName);
      queue?.remove(file);

      return;
    }

    this.isUploading = true;
    this.currentFile = file;
    this.uploadProgress = 0;

    try {
      const uploadItem = (await waitForPromise(
        this.store.queryRecord('upload-app', { offsec: true })
      )) as UploadAppModel;

      this.uploadRequest = file.uploadBinary(uploadItem.url, {
        method: 'PUT',
        withCredentials: false,
      });

      await waitForPromise(this.uploadRequest);

      this.offsecNewAssessment.setUploadedApp({
        uploadItem,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      });

      this.notify.success(this.intl.t('fileUploadedSuccessfully'));
    } catch (error) {
      if (!this.isLeaveConfirmed) {
        this.notify.error(this.intl.t('errorWhileUploading'));
      }
    } finally {
      this.isUploading = false;
      this.currentFile = null;
      this.uploadRequest = null;
    }
  }

  @action
  async beginAssessment() {
    const uploadItem = this.offsecNewAssessment.uploadItem;
    if (!uploadItem) {
      return;
    }

    this.isStartingAssessment = true;

    try {
      const credentialsPayload =
        this.offsecNewAssessment.completeCredentials.map((c) => ({
          role: c.role.trim(),
          role_label: c.role.trim(),
          username: c.username.trim(),
          email: c.username.trim(),
          password: c.password,
        }));

      await waitForPromise(
        uploadItem.save({
          adapterOptions: {
            offsec: true,
            assessment_type: this.offsecNewAssessment.assessmentType,
            credentials: credentialsPayload,
          },
        })
      );

      this.realtime.incrementProperty('SubmissionCounter');
      this.notify.success(this.intl.t('offensiveSecurity.assessmentStarted'));
      this.offsecNewAssessment.reset();
      this.offsecNewAssessment.markAssessmentStarted();
      this.waitForStartedScan.perform();
    } catch (error) {
      this.notify.error(this.intl.t('errorWhileUploading'));
    } finally {
      this.isStartingAssessment = false;
    }
  }

  /** Polls until the scan for the begun assessment exists, then opens it. */
  waitForStartedScan = task({ restartable: true }, async () => {
    for (let i = 0; i < STARTED_SCAN_POLL_MAX_ATTEMPTS; i++) {
      try {
        const scans = await waitForPromise(
          this.store.query('offsec-scan', { limit: 50, offset: 0 })
        );

        const startedScan = this.offsecNewAssessment.findStartedScan(
          scans.slice()
        );

        if (startedScan) {
          this.offsecNewAssessment.clearAssessmentStarted();

          this.router.transitionTo(
            'authenticated.offensive-security.scan',
            startedScan.id
          );

          return;
        }
      } catch (error) {
        // transient failure, keep polling
      }

      await timeout(STARTED_SCAN_POLL_INTERVAL_MS);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::NewAssessment': typeof OffensiveSecurityNewAssessmentComponent;
  }
}
