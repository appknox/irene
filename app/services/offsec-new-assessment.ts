import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type UploadAppModel from 'irene/models/upload-app';
import type OffsecScanModel from 'irene/models/offsec-scan';

export type AssessmentType = 'comprehensive' | 'resilience';

export class CredentialRow {
  id: string;
  @tracked role: string;
  @tracked username: string;
  @tracked password: string;
  @tracked showPassword: boolean;

  constructor(
    id: string,
    role = '',
    username = '',
    password = '',
    showPassword = false
  ) {
    this.id = id;
    this.role = role;
    this.username = username;
    this.password = password;
    this.showPassword = showPassword;
  }
}

// Server and client clocks drift; a scan created slightly "before" Begin is still ours
const STARTED_SCAN_CLOCK_SKEW_MS = 2 * 60 * 1000;

export interface UploadedAppMeta {
  name: string;
  size: number;
  type?: string;
}

export default class OffsecNewAssessmentService extends Service {
  @tracked uploadItem: UploadAppModel | null = null;
  @tracked uploadedFile: UploadedAppMeta | null = null;
  @tracked assessmentType: AssessmentType = 'comprehensive';
  @tracked credentials: CredentialRow[] = [
    new CredentialRow('1'),
    new CredentialRow('2'),
    new CredentialRow('3'),
  ];

  @tracked assessmentStartedAt: number | null = null;

  /** Returns the scan created for the assessment begun on this page, if it has appeared yet. */
  findStartedScan(scans: OffsecScanModel[]): OffsecScanModel | null {
    if (this.assessmentStartedAt === null) {
      return null;
    }

    const threshold = this.assessmentStartedAt - STARTED_SCAN_CLOCK_SKEW_MS;

    const candidates = scans.filter(
      (scan) => scan.createdAt && scan.createdAt.getTime() >= threshold
    );

    candidates.sort(
      (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
    );

    return candidates[0] ?? null;
  }

  @action
  markAssessmentStarted() {
    this.assessmentStartedAt = Date.now();
  }

  @action
  clearAssessmentStarted() {
    this.assessmentStartedAt = null;
  }

  @action
  setUploadedApp({
    uploadItem,
    file,
  }: {
    uploadItem: UploadAppModel;
    file: UploadedAppMeta;
  }) {
    this.uploadItem = uploadItem;
    this.uploadedFile = file;
  }

  @action
  clearUploadedApp() {
    this.uploadItem = null;
    this.uploadedFile = null;
  }

  @action
  setAssessmentType(type: AssessmentType) {
    this.assessmentType = type;
  }

  @action
  addCredential() {
    const nextId = String(Date.now() + Math.random());
    this.credentials = [...this.credentials, new CredentialRow(nextId)];
  }

  @action
  removeCredential(index: number) {
    this.credentials = this.credentials.filter((_, i) => i !== index);
  }

  @action
  updateCredential(
    index: number,
    field: 'role' | 'username' | 'password',
    value: string
  ) {
    const cred = this.credentials[index];
    if (cred) {
      cred[field] = value;
    }
  }

  @action
  toggleShowPassword(index: number) {
    const cred = this.credentials[index];
    if (cred) {
      cred.showPassword = !cred.showPassword;
    }
  }

  @action
  reset() {
    this.uploadItem = null;
    this.uploadedFile = null;
    this.assessmentType = 'comprehensive';
    this.credentials = [
      new CredentialRow('1'),
      new CredentialRow('2'),
      new CredentialRow('3'),
    ];
  }
}

declare module '@ember/service' {
  interface Registry {
    'offsec-new-assessment': OffsecNewAssessmentService;
  }
}
