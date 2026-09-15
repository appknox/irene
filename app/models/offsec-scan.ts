import Model, { attr } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

export enum ResilienceBandEnum {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

export const BAND_TO_RISK_RATING: Record<
  string,
  'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
> = {
  [ResilienceBandEnum.WEAK]: 'CRITICAL',
  [ResilienceBandEnum.MODERATE]: 'HIGH',
  [ResilienceBandEnum.STRONG]: 'MEDIUM',
  [ResilienceBandEnum.VERY_STRONG]: 'LOW',
  'very-strong': 'LOW',
};

/** Artifact metadata. Download URLs are minted on demand — see the adapter. */
export interface OffsecScanArtifact {
  name: string;
  size: number;
  content_type: string;
  download_url?: string;
  description?: string;
  desc?: string;
}

/** Findings arrive embedded on the detail response; absent on list payloads. */
export interface OffsecScanEmbeddedFinding {
  id: number;
  signature_id: string;
  group?: string;
  name: string;
  category: string;
  check_type: string;
  detected: boolean;
  // True when the check fired at runtime (it has a detection backtrace), as opposed to being
  // detected only by static analysis. Distinguishes a triggered check from an untriggered one.
  triggered?: boolean;
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
  declare findings:
    | OffsecScanEmbeddedFinding[]
    | Record<
        string,
        | OffsecScanEmbeddedFinding
        | OffsecScanEmbeddedFinding[]
        | Record<string, unknown>
      >
    | undefined;

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

  @attr('date')
  declare completedAt: Date | null;

  @attr('date')
  declare createdAt: Date | null;

  @attr('date')
  declare updatedAt: Date | null;

  @tracked cachedLogLines?: string[];
  @tracked cachedLogUrl?: string;
  @tracked logAttempted?: boolean;

  get formattedUploadedOn(): string | null {
    if (!this.createdAt) {
      return null;
    }

    return dayjs(this.createdAt).format('ddd MMM DD YYYY, h:mm:ss A');
  }

  get targetFileId(): number | string | null {
    let raw: unknown =
      this.fileId ??
      (this as unknown as Record<string, unknown>)['file_id'] ??
      (this as unknown as Record<string, unknown>)['file'];

    if (
      raw &&
      typeof raw === 'object' &&
      'id' in (raw as Record<string, unknown>)
    ) {
      raw = (raw as Record<string, unknown>)['id'];
    }

    if (
      (typeof raw === 'number' || typeof raw === 'string') &&
      String(raw).trim() !== ''
    ) {
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

  get appIconUrl(): string | null {
    return (
      this.iconUrl ||
      this.appLogoUrl ||
      ((this as unknown as Record<string, unknown>)['icon_url'] as string) ||
      ((this as unknown as Record<string, unknown>)[
        'app_logo_url'
      ] as string) ||
      null
    );
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

  get devFrameworkCode(): number | string | null {
    return (
      this.devFramework ??
      (this as unknown as Record<string, unknown>)['dev_framework'] ??
      (this as unknown as Record<string, unknown>)['development_framework'] ??
      null
    );
  }

  get devFrameworkLabel(): string {
    const raw = this.devFrameworkCode;

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
      if (!Number.isNaN(numKey) && numKey in frameworkMap) {
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

  get displayErrorMessage(): string | null {
    const reason = this.statusReason;
    if (reason && String(reason).trim()) {
      return String(reason)
        .trim()
        .replaceAll(
          'result.resilience.json',
          '"Risk rating + per-finding results"'
        );
    }

    return null;
  }

  get displayName(): string {
    return (
      this.appName || this.fileName || this.packageName || `scan ${this.id}`
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
  get effectiveResilience(): number | null {
    if (
      this.overallResilience !== null &&
      this.overallResilience !== undefined
    ) {
      return this.overallResilience;
    }

    const detected = this.protectionsDetected ?? 0;

    if (detected === 0) {
      return null;
    }

    const bypassed = this.protectionsBypassed ?? 0;

    return Math.round(((detected - bypassed) / detected) * 100);
  }

  get effectiveRiskRating(): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | null {
    if (!this.isTerminal) {
      return null;
    }

    const rating = (this.riskRating || '').trim().toUpperCase();

    if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(rating)) {
      return rating as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    }

    if (rating === 'MODERATE') {
      return 'HIGH';
    }

    const band = (this.resilienceBand || '').toLowerCase().replace('-', '_');

    if (band && BAND_TO_RISK_RATING[band]) {
      return BAND_TO_RISK_RATING[band];
    }

    return null;
  }

  get riskClass():
    | 'critical'
    | 'high'
    | 'medium'
    | 'low'
    | 'unknown'
    | 'not_assessed' {
    const effective = this.effectiveRiskRating;

    if (effective) {
      return effective.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
    }

    if (!this.isTerminal) {
      return 'unknown';
    }

    return 'not_assessed';
  }

  get resilienceClass():
    | 'weak'
    | 'medium'
    | 'strong'
    | 'very-strong'
    | 'unknown' {
    const score = this.effectiveResilience;

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

  get protectionsResisted(): number {
    const total = this.findingsAssessed ?? this.protectionsDetected ?? 0;

    return Math.max(total - (this.protectionsBypassed ?? 0), 0);
  }

  get hasResilience(): boolean {
    return (
      this.isCompleted &&
      this.overallResilience !== null &&
      this.overallResilience !== undefined
    );
  }

  /** Single source for the date the list both shows and sorts on. */
  get scannedOn(): Date | null {
    return this.completedAt ?? this.createdAt;
  }

  get scannedOnLabel(): string {
    return this.scannedOn ? dayjs(this.scannedOn).format('DD-MM-YYYY') : '-';
  }

  get protectionsBypassedLabel(): string {
    if (
      this.protectionsBypassed !== null &&
      this.protectionsBypassed !== undefined
    ) {
      return String(this.protectionsBypassed);
    }

    return '—';
  }

  get artifactList(): OffsecScanArtifact[] {
    return this.artifacts ?? [];
  }

  get findingList(): OffsecScanEmbeddedFinding[] {
    const raw = this.findings;
    let list: OffsecScanEmbeddedFinding[] = [];

    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw && typeof raw === 'object') {
      list = parseFindingsObject(raw as Record<string, unknown>);
    }

    // Keep every detected protection and every attempted one; drop only entries that were neither
    // detected nor attempted (noise). A detected-but-untested protection (a probe the run never
    // reached) still belongs in the list, with its unassessed badge.
    return list.filter(isFindingRelevant);
  }
}

function parseFindingItem(
  item: unknown,
  key: string,
  fallbackOrder?: number
): OffsecScanEmbeddedFinding | null {
  if (!item || typeof item !== 'object') {
    return null;
  }
  const findingItem = item as OffsecScanEmbeddedFinding;

  return {
    ...findingItem,
    group: findingItem.group || key,
    signature_id: findingItem.signature_id || key,
    ...(fallbackOrder !== undefined
      ? { order: findingItem.order ?? fallbackOrder }
      : {}),
  };
}

function parseFindingsObject(
  raw: Record<string, unknown>
): OffsecScanEmbeddedFinding[] {
  const list: OffsecScanEmbeddedFinding[] = [];

  for (const [key, val] of Object.entries(raw)) {
    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        const finding = parseFindingItem(item, key, index);
        if (finding) {
          list.push(finding);
        }
      });
    } else {
      const finding = parseFindingItem(val, key);
      if (finding) {
        list.push(finding);
      }
    }
  }

  return list;
}

function isFindingRelevant(finding: OffsecScanEmbeddedFinding): boolean {
  if (!finding.outcome) {
    return false;
  }
  if (finding.detected) {
    return true;
  }

  return (
    finding.outcome !== 'not_attempted' && finding.outcome !== 'unassessed'
  );
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'offsec-scan': OffsecScanModel;
  }
}
