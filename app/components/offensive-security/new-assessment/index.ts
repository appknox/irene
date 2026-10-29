import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task, timeout } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
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

  fileQueueName = 'offsecAssessmentUpload';

  get progress(): number {
    const queue = this.fileQueue.find(this.fileQueueName);
    const prog =
      this.currentFile?.progress ?? queue?.progress ?? this.uploadProgress ?? 0;

    return Math.min(100, Math.max(0, Math.round(prog)));
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

  get isComprehensive(): boolean {
    return this.offsecNewAssessment.assessmentType === 'comprehensive';
  }

  get credentials() {
    return this.offsecNewAssessment.credentials;
  }

  get hasValidCredentials(): boolean {
    return this.credentials.some(
      (c) => Boolean(c.username?.trim()) && Boolean(c.password?.trim())
    );
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
    return this.hasUploadedApp && this.hasValidCredentials
      ? 'done'
      : 'upcoming';
  }

  get isBeginDisabled(): boolean {
    if (this.isStartingAssessment) {
      return true;
    }

    if (!this.hasUploadedApp) {
      return true;
    }

    return false;
  }

  get beginCtaLabel(): string {
    return this.isComprehensive
      ? this.intl.t('offensiveSecurity.beginAssessmentComprehensive')
      : this.intl.t('offensiveSecurity.beginAssessmentResilience');
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

      await waitForPromise(
        file.uploadBinary(uploadItem.url, {
          method: 'PUT',
          withCredentials: false,
        })
      );

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
      this.notify.error(this.intl.t('errorWhileUploading'));
    } finally {
      this.isUploading = false;
      this.currentFile = null;
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
      const credentialsPayload = this.credentials
        .filter(
          (c) => Boolean(c.username?.trim()) && Boolean(c.password?.trim())
        )
        .map((c) => ({
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
