import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

import type FileModel from './file';

export interface StoreReleaseReadinessScanFinding {
  id: number;
  check_id: string;
  title: string;
  category: string;
  severity: number;
  passed: boolean | null;
  evidence: string;
  remediation_steps: string[];
  guideline_reference: string;
  platform: number;
  explanation: string;
  source: string;
  field_checked: string;
  expected: string;
  signal_enriched: boolean;
  enrichment_details: Record<string, unknown>;
  is_overridden: boolean;
  overridden_by: string | null;
  overridden_at: string | null;
  override_comment: string;
  created_at: string;
}

export default class StoreReleaseReadinessScanModel extends Model {
  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('string')
  declare fileName: string;

  @attr('number')
  declare projectId: number;

  @attr('string')
  declare packageName: string;

  @attr('number')
  declare platform: number;

  @attr('number')
  declare status: number;

  @attr('number')
  declare verdict: number;

  @attr('string')
  declare verdictDisplay: string;

  @attr('number')
  declare totalChecks: number;

  @attr('number')
  declare passedCount: number;

  @attr('number')
  declare failedCount: number;

  @attr('number')
  declare blockerCount: number;

  @attr('number')
  declare warningCount: number;

  @attr('number')
  declare untestedCount: number;

  @attr('number')
  declare overriddenCount: number;

  @attr('date')
  declare createdAt: Date | null;

  @attr('date')
  declare completedAt: Date | null;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare errorMessage: string | null;

  @attr('date')
  declare updatedAt: Date | null;

  /** Present on detail `findRecord` responses; omitted on list payloads. */
  @attr()
  declare findings: StoreReleaseReadinessScanFinding[] | undefined;

  get displayName(): string {
    return this.fileName || this.packageName || '';
  }

  get platformIcon(): 'android' | 'apple' {
    return this.platform === ENUMS.PLATFORM.IOS ? 'apple' : 'android';
  }

  get isNotStarted(): boolean {
    return this.status === ENUMS.STORE_RELEASE_SCAN_STATUS.NOT_STARTED;
  }

  get isInProgress(): boolean {
    return this.status === ENUMS.STORE_RELEASE_SCAN_STATUS.IN_PROGRESS;
  }

  get isPartial(): boolean {
    return this.status === ENUMS.STORE_RELEASE_SCAN_STATUS.PARTIAL;
  }

  get isCompleted(): boolean {
    return this.status === ENUMS.STORE_RELEASE_SCAN_STATUS.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === ENUMS.STORE_RELEASE_SCAN_STATUS.FAILED;
  }

  get releaseDateLabel(): string {
    return this.createdAt ? dayjs(this.createdAt).format('MMM DD, YYYY') : '-';
  }

  get lastScannedOnLabel(): string {
    const lastScannedOn = this.completedAt ?? this.createdAt;

    return lastScannedOn ? dayjs(lastScannedOn).format('MMM DD, YYYY') : '-';
  }

  get summaryFailed(): number {
    return this.failedCount ?? 0;
  }

  get summaryBlocker(): number {
    return this.blockerCount ?? 0;
  }

  get summaryWarning(): number {
    return this.warningCount ?? 0;
  }

  get summaryPassed(): number {
    return this.passedCount ?? 0;
  }

  get summaryUntested(): number {
    return this.untestedCount ?? 0;
  }

  get summaryOverridden(): number {
    return this.overriddenCount ?? 0;
  }

  get summaryLoading(): boolean {
    return this.isInProgress;
  }

  get summaryPassedRowLoading(): boolean {
    return this.isInProgress || this.isPartial;
  }

  get summaryUntestedRowLoading(): boolean {
    return this.isInProgress || this.isPartial;
  }

  get packageNameValue(): string {
    return this.packageName || '';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'store-release-readiness-scan': StoreReleaseReadinessScanModel;
  }
}
