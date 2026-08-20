import Model, { attr } from '@ember-data/model';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

/** Artifact metadata. Download URLs are minted on demand — see the adapter. */
export interface OffsecScanArtifact {
  name: string;
  size: number;
  content_type: string;
}

/** Findings arrive embedded on the detail response; absent on list payloads. */
export interface OffsecScanEmbeddedFinding {
  id: number;
  signature_id: string;
  name: string;
  category: string;
  check_type: string;
  detected: boolean;
  outcome: string;
  score: number | null;
  band: string;
  rationale: string;
  order: number;
  evidence_ids: string[];
}

export default class OffsecScanModel extends Model {
  @attr('number')
  declare fileId: number;

  @attr('number')
  declare projectId: number;

  @attr('string')
  declare fileName: string;

  @attr('string')
  declare packageName: string;

  /**
   * Friendly app name and version, mirrored onto the scan payload from the file the
   * run targeted. Both are absent on older payloads, so every reader must fall back.
   */
  @attr('string')
  declare appName: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare platform: string;

  @attr('number')
  declare status: number;

  @attr('string')
  declare statusReason: string;

  @attr('string')
  declare objective: string;

  @attr('string')
  declare deviceSerial: string;

  @attr('string')
  declare riskRating: string;

  @attr('number')
  declare overallResilience: number | null;

  @attr('string')
  declare resilienceBand: string;

  /**
   * Headline counters, protection-centric because the agent runs the investigate lane:
   * it reports the mechanisms it found and assessed, not a tally of attacks.
   * `findingsUnassessed` is the honest denominator — detected but never attempted.
   */
  @attr('number')
  declare protectionsDetected: number;

  @attr('number')
  declare protectionsBypassed: number;

  @attr('number')
  declare findingsAssessed: number;

  @attr('number')
  declare findingsUnassessed: number;

  /**
   * The agent's narrative envelope (claim, confidence, evidence count) — its shape
   * depends on the run kind and it carries no numbers on this lane. Never the source
   * of the counters above; those are flattened onto the payload's top level.
   */
  @attr()
  declare summary: Record<string, unknown> | undefined;

  @attr()
  declare artifacts: OffsecScanArtifact[] | undefined;

  @attr()
  declare findings: OffsecScanEmbeddedFinding[] | undefined;

  @attr('string')
  declare appLogoUrl: string;

  @attr('string')
  declare iconUrl: string;

  @attr('string')
  declare versionCode: string;

  @attr('number')
  declare devFramework: number;

  @attr('boolean')
  declare isStaticScanStarted: boolean;

  @attr('boolean')
  declare staticScanStarted: boolean;

  @attr('string')
  declare sha1hash: string;

  @attr('string')
  declare sha1: string;

  @attr('string')
  declare md5hash: string;

  @attr('string')
  declare md5: string;

  @attr('string')
  declare sha256: string;

  @attr('string')
  declare injection: string;

  @attr('number')
  declare attacksLaunched: number;

  @attr('number')
  declare attacksExploited: number;

  @attr('number')
  declare attacksDefended: number;

  @attr('string')
  declare errorMessage: string | null;

  @attr('date')
  declare completedAt: Date | null;

  @attr('date')
  declare createdAt: Date | null;

  @attr('date')
  declare updatedAt: Date | null;

  get formattedUploadedOn(): string | null {
    if (!this.createdAt) {
      return null;
    }
    return dayjs(this.createdAt).format('ddd MMM DD YYYY, h:mm:ss A');
  }

  get targetFileId(): number | string | null {
    const raw =
      this.fileId ??
      (this as unknown as Record<string, unknown>)['file_id'] ??
      (this as unknown as Record<string, unknown>)['file'];

    if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
      return raw as number | string;
    }
    return this.id ? String(this.id) : null;
  }

  get sha1Value(): string | null {
    return this.sha1hash || this.sha1 || null;
  }

  get md5Value(): string | null {
    return this.md5hash || this.md5 || null;
  }

  get versionLabel(): string {
    if (
      this.version !== null &&
      this.version !== undefined &&
      String(this.version).trim() !== ''
    ) {
      return String(this.version);
    }
    return '—';
  }

  get devFrameworkLabel(): string {
    const raw =
      this.devFramework ??
      (this as unknown as Record<string, unknown>)['dev_framework'] ??
      (this as unknown as Record<string, unknown>)['development_framework'];

    const frameworkMap: Record<number, string> = {
      [-1]: 'Unknown',
      0: 'Android Native',
      1: 'React Native',
      2: 'Flutter',
      3: 'Xamarin',
      4: 'Cordova',
      5: 'Android (Unknown)',
      6: 'iOS Native',
      7: 'Swift',
      8: 'React Native',
      9: 'Flutter',
      10: 'Xamarin',
      11: 'Cordova',
      12: 'iOS (Unknown)',
    };

    if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
      const numKey = Number(raw);
      if (!isNaN(numKey) && numKey in frameworkMap) {
        return frameworkMap[numKey] ?? '—';
      }
      if (typeof raw === 'string' && (raw as string).trim()) {
        return raw as string;
      }
    }

    return '—';
  }

  get isStaticScanStartedValue(): boolean {
    return Boolean(
      this.isStaticScanStarted ??
        this.staticScanStarted ??
        (this as unknown as Record<string, unknown>)[
          'is_static_scan_started'
        ] ??
        (this as unknown as Record<string, unknown>)['static_scan_started']
    );
  }

  get displayName(): string {
    return (
      this.fileName || this.appName || this.packageName || `scan ${this.id}`
    );
  }

  get platformIcon(): 'android' | 'apple' {
    return this.platform === 'ios' ? 'apple' : 'android';
  }

  get isNotStarted(): boolean {
    return this.status === ENUMS.OFFSEC_SCAN_STATUS.NOT_STARTED;
  }

  get isQueued(): boolean {
    return this.status === ENUMS.OFFSEC_SCAN_STATUS.QUEUED;
  }

  get isRunning(): boolean {
    return this.status === ENUMS.OFFSEC_SCAN_STATUS.RUNNING;
  }

  get isCompleted(): boolean {
    return this.status === ENUMS.OFFSEC_SCAN_STATUS.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === ENUMS.OFFSEC_SCAN_STATUS.FAILED;
  }

  /** Terminal runs stop polling and can load their persisted log. */
  get isTerminal(): boolean {
    return this.isCompleted || this.isFailed;
  }

  get isInProgress(): boolean {
    return !this.isTerminal;
  }

  /**
   * Risk bucket for the table's colour coding. Falls back to the resilience band
   * when the agent did not emit a rating, so a completed run is never blank.
   */
  get riskClass(): 'critical' | 'high' | 'medium' | 'low' | 'unknown' {
    const rating = (this.riskRating || '').toLowerCase();

    if (['critical', 'high', 'medium', 'low'].includes(rating)) {
      return rating as 'critical' | 'high' | 'medium' | 'low';
    }

    switch ((this.resilienceBand || '').toLowerCase()) {
      case 'weak':
        return 'critical';
      case 'moderate':
        return 'medium';
      case 'strong':
      case 'very_strong':
        return 'low';
      default:
        return 'unknown';
    }
  }

  /**
   * Resilience bucket derived from the score rather than the API's `resilience_band`,
   * so the number and the word on the list pill can never disagree.
   */
  get resilienceClass():
    | 'weak'
    | 'medium'
    | 'strong'
    | 'very-strong'
    | 'unknown' {
    const score = this.overallResilience;

    if (score === null || score === undefined) {
      return 'unknown';
    }

    if (score < 40) {
      return 'weak';
    }

    if (score < 80) {
      return 'medium';
    }

    if (score < 95) {
      return 'strong';
    }

    return 'very-strong';
  }

  /**
   * How many protections held. Not sent by the agent, which reports what it assessed
   * and what it got past — the remainder is what resisted. Clamped, so a half-synced
   * run shows nothing rather than a negative count.
   */
  get protectionsResisted(): number {
    return Math.max(
      (this.findingsAssessed ?? 0) - (this.protectionsBypassed ?? 0),
      0
    );
  }

  /** Resilience only means something once a run has actually finished scoring. */
  get hasResilience(): boolean {
    return this.isCompleted && this.overallResilience !== null;
  }

  /** Single source for the date the list both shows and sorts on. */
  get scannedOn(): Date | null {
    return this.completedAt ?? this.createdAt;
  }

  get scannedOnLabel(): string {
    return this.scannedOn ? dayjs(this.scannedOn).format('DD-MM-YYYY') : '-';
  }

  get artifactList(): OffsecScanArtifact[] {
    return this.artifacts ?? [];
  }

  get findingList(): OffsecScanEmbeddedFinding[] {
    return this.findings ?? [];
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'offsec-scan': OffsecScanModel;
  }
}
