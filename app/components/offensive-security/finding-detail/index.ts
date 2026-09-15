import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import { task } from 'ember-concurrency';
import type { SafeString } from '@ember/template/-private/handlebars';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type OffsecFindingModel from 'irene/models/offsec-finding';
import type { OffsecFindingEvidence } from 'irene/models/offsec-finding';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type OffsecScanAdapter from 'irene/adapters/offsec-scan';

export interface OffensiveSecurityFindingDetailSignature {
  Args: {
    scanId: string;
    findingId: string;
  };
}

export interface ReproduceStep {
  step: number;
  text: string;
  code?: string;
}

export interface ScoringFactor {
  title: string;
  desc: string;
  points: string;
  isBase?: boolean;
  isMinus?: boolean;
}

export default class OffensiveSecurityFindingDetailComponent extends Component<OffensiveSecurityFindingDetailSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked finding: OffsecFindingModel | null = null;
  @tracked scan: OffsecScanModel | null = null;
  @tracked isDrawerOpen = false;
  @tracked isExploitCopied = false;
  @tracked copiedPayloadId: string | number | null = null;
  @tracked showEarlierAttempts = false;

  constructor(
    owner: unknown,
    args: OffensiveSecurityFindingDetailSignature['Args']
  ) {
    super(owner, args);

    if (args.scanId) {
      this.scan = this.store.peekRecord('offsec-scan', args.scanId);
    }

    this.loadFinding.perform(args.findingId);
  }

  get isLoading() {
    return this.loadFinding.isRunning;
  }

  get evidence(): OffsecFindingEvidence[] {
    const raw = this.finding?.evidence;
    let list: OffsecFindingEvidence[];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw && typeof raw === 'object') {
      list = Object.values(raw) as OffsecFindingEvidence[];
    } else {
      list = this.finding?.evidenceList ?? [];
    }

    // On-device navigation and housekeeping steps show how the agent drove the screen, not whether
    // a protection is present. Nebula already drops these, but old scans may still carry them.
    const navigationTools = new Set([
      'android',
      'android:ui_click',
      'android:ui_get_text',
      'android:app_start',
      'app_logcat',
      'workspace_prepare',
      'completion_gate',
    ]);

    return list.filter(
      (item) =>
        !navigationTools.has(item?.tool || '') &&
        (item?.source || '').toLowerCase() !== 'ui'
    );
  }

  get staticEvidence(): Array<Record<string, unknown>> {
    const raw = this.finding?.detail?.['static_evidence'];

    return Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
  }

  get hasStaticEvidence() {
    return this.staticEvidence.length > 0;
  }

  get checkTypeLabel() {
    if (!this.finding?.checkType) {
      return 'Findings';
    }
    const label = this.finding.checkType.replaceAll('_', ' ');

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get categoryLabel() {
    return this.finding?.category || 'resilience';
  }

  get scoreNumber() {
    const rawScore = this.finding?.score;
    const scoreVal =
      typeof rawScore === 'number'
        ? rawScore
        : Number.parseInt(String(rawScore || '10'), 10);

    return Number.isNaN(scoreVal) ? 10 : Math.max(0, Math.min(100, scoreVal));
  }

  get scoreProgressStyle(): SafeString {
    return htmlSafe(`width: ${this.scoreNumber}%;`);
  }

  private get scoreBandLabel() {
    if (this.scoreNumber <= 39) {
      return 'Weak';
    }
    if (this.scoreNumber <= 69) {
      return 'Moderate';
    }

    return 'Strong';
  }

  get bandTag() {
    const band = this.finding?.bandLabel || this.scoreBandLabel;

    return `${band.toUpperCase()} RESILIENCE`;
  }

  get isWeak() {
    return this.scoreNumber <= 39;
  }

  get isModerate() {
    return this.scoreNumber >= 40 && this.scoreNumber <= 69;
  }

  get isStrong() {
    return this.scoreNumber >= 70;
  }

  get attemptsList(): Array<Record<string, unknown>> {
    const rawAttempts = this.finding?.attempts;
    if (Array.isArray(rawAttempts)) {
      return rawAttempts.filter(
        (a): a is Record<string, unknown> => Boolean(a) && typeof a === 'object'
      );
    }
    if (rawAttempts && typeof rawAttempts === 'object') {
      return (Object.values(rawAttempts) as unknown[]).filter(
        (a): a is Record<string, unknown> => Boolean(a) && typeof a === 'object'
      );
    }

    return [];
  }

  get effectiveAttempt(): Record<string, unknown> | null {
    const attempts = this.attemptsList;
    if (!attempts.length) {
      return null;
    }

    return (
      attempts.find(
        (a) => a['state'] === 'verified_effective' || a['state'] === 'verified'
      ) ||
      attempts[attempts.length - 1] ||
      null
    );
  }

  get effectiveAttemptEvidence(): string[] {
    const raw = this.effectiveAttempt?.['evidence'];
    if (Array.isArray(raw)) {
      return raw.map((item) =>
        typeof item === 'object' && item !== null
          ? JSON.stringify(item)
          : String(item)
      );
    }
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return [raw.trim()];
    }
    if (raw && typeof raw === 'object') {
      return Object.values(raw).map((item) =>
        typeof item === 'object' && item !== null
          ? JSON.stringify(item)
          : String(item)
      );
    }

    return [];
  }

  get earlierAttempts(): Array<Record<string, unknown>> {
    const attempts = this.attemptsList;
    const eff = this.effectiveAttempt;
    if (!eff || attempts.length <= 1) {
      return [];
    }

    return attempts.filter((a) => a !== eff);
  }

  get isVerified() {
    if (!this.finding) {
      return false;
    }
    if (
      this.effectiveAttempt?.['state'] === 'verified_effective' ||
      this.effectiveAttempt?.['state'] === 'verified'
    ) {
      return true;
    }

    return this.attemptsList.some(
      (a) => a['state'] === 'verified_effective' || a['state'] === 'verified'
    );
  }

  get isExploitAttached(): boolean {
    if (!this.finding) {
      return false;
    }

    // 1. Check if an exploit script is present
    if (this.hasExploit) {
      return true;
    }

    // 2. Exploit evidence explicitly attached on finding or detail
    const detail = this.finding.detail;
    const exploitEv =
      this.finding.exploitEvidence ||
      detail?.['exploit_evidence'] ||
      (this.finding as unknown as Record<string, unknown>)?.[
        'exploit_evidence'
      ];
    if (
      (Array.isArray(exploitEv) && exploitEv.length > 0) ||
      (typeof exploitEv === 'object' &&
        exploitEv !== null &&
        Object.keys(exploitEv).length > 0)
    ) {
      return true;
    }

    // 3. Evidence list has an item associated with the exploit tool or source
    return this.evidence.some(
      (ev) =>
        ev.source === 'exploit' || ev.tool === 'frida' || ev.tool === 'exploit'
    );
  }

  get targetPackage(): string {
    // Try to find package from evidence content/metadata
    for (const ev of this.evidence) {
      const content = ev.content || ev.metadata;
      if (typeof content === 'object' && content !== null) {
        const obj = content as Record<string, unknown>;
        const currentApp = obj['current_app'] as
          | Record<string, unknown>
          | undefined;
        const clicked = obj['clicked'] as Record<string, unknown> | undefined;
        const pkg =
          (typeof obj['package'] === 'string' && obj['package']) ||
          (typeof currentApp?.['package'] === 'string' &&
            currentApp['package']) ||
          (typeof clicked?.['package'] === 'string' && clicked['package']);
        if (pkg) {
          return pkg;
        }
      } else if (typeof content === 'string') {
        const match = /"package":\s*"([^"]+)"/.exec(content);
        if (match?.[1]) {
          return match[1];
        }
      }
    }

    return 'com.target.app';
  }

  get exploitFileName(): string {
    const sig = this.finding?.signatureId || 'exploit';
    const sanitized = sig
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+/, '')
      .replace(/_+$/, '');

    return `${sanitized}_bypass.js`;
  }

  get exploitScript(): string {
    const fridaScriptCandidate =
      this.finding?.fridaScript ||
      (this.finding?.detail?.['frida_script'] as string | undefined) ||
      ((this.finding as unknown as Record<string, unknown>)?.[
        'frida_script'
      ] as string | undefined) ||
      (this.finding?.bypassAttempted?.['frida_script'] as string | undefined);

    if (
      typeof fridaScriptCandidate === 'string' &&
      fridaScriptCandidate.trim().length > 0
    ) {
      return fridaScriptCandidate.trim();
    }

    const detail = this.finding?.detail;
    if (detail?.['script'] && typeof detail['script'] === 'string') {
      return detail['script'].trim();
    }
    if (
      detail?.['exploit_script'] &&
      typeof detail['exploit_script'] === 'string'
    ) {
      return detail['exploit_script'].trim();
    }
    if (detail?.['exploit'] && typeof detail['exploit'] === 'string') {
      return detail['exploit'].trim();
    }
    if (
      this.finding?.bypassAttempted?.['script'] &&
      typeof this.finding.bypassAttempted['script'] === 'string'
    ) {
      return (this.finding.bypassAttempted['script'] as string).trim();
    }

    return '';
  }

  get hasExploit() {
    return this.exploitScript.trim().length > 0;
  }

  get detectionBacktrace(): Array<Record<string, unknown>> {
    const raw = this.finding?.detail?.['detection_backtrace'];

    return Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
  }

  get hasBacktrace() {
    return this.detectionBacktrace.length > 0;
  }

  get smaliPatch(): Record<string, unknown> | null {
    const raw = this.finding?.detail?.['smali_patch'];

    return raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : null;
  }

  get smaliPatchText(): string {
    const patch = this.smaliPatch;
    const diff = patch?.['diff'] ?? patch?.['new_body'];

    return typeof diff === 'string' ? diff : '';
  }

  get smaliPatchPath(): string {
    const path = this.smaliPatch?.['path'];

    return typeof path === 'string' ? path : '';
  }

  get patchedApkServerName(): string {
    const raw = this.finding?.detail?.['patched_apk'];
    const name =
      raw && typeof raw === 'object'
        ? (raw as Record<string, unknown>)['name']
        : undefined;

    return typeof name === 'string' && name ? name : 'patched.apk';
  }

  get patchedApkBaseName(): string {
    let candidate =
      this.scan?.appName ||
      this.scan?.displayName ||
      this.scan?.fileName ||
      this.targetPackage ||
      '';

    if (!candidate && this.scanName && !this.scanName.startsWith('Scan')) {
      candidate = this.scanName;
    }

    if (!candidate) {
      return '';
    }

    const clean = candidate.replace(/\.(apk|ipa|aab|zip)$/i, '');

    return clean
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+/, '')
      .replace(/_+$/, '');
  }

  get patchedApkName(): string {
    const base = this.patchedApkBaseName;
    if (base) {
      return `${base}_patch.apk`;
    }

    const serverName = this.patchedApkServerName;
    if (serverName && serverName !== 'patched.apk') {
      return serverName;
    }

    return 'patch.apk';
  }

  get hasPatchedApk() {
    const raw = this.finding?.detail?.['patched_apk'];

    return Boolean(raw) && Boolean(this.scanId);
  }

  get reproduceSteps(): ReproduceStep[] {
    const pkg = this.targetPackage;
    const file = this.exploitFileName;

    return [
      {
        step: 1,
        text: 'Attach the hook at launch:',
        code: `frida -U -f ${pkg} -l ${file} --no-pause`,
      },
      {
        step: 2,
        text: 'Cold-start the app so the probe runs during init.',
      },
      {
        step: 3,
        text: 'Confirm the app proceeds to its main screen instead of the security gate.',
      },
    ];
  }

  get ledeDescription(): string {
    if (this.finding?.rationale) {
      return this.finding.rationale;
    }

    return '';
  }

  get rawImpact(): unknown {
    return (
      this.finding?.impact ||
      this.finding?.detail?.['impact'] ||
      (this.finding as unknown as Record<string, unknown>)?.['impact']
    );
  }

  get hasImpact() {
    const raw = this.rawImpact;
    if (!raw) {
      return false;
    }
    if (typeof raw === 'string') {
      return raw.trim().length > 0;
    }
    if (typeof raw === 'object') {
      if (Array.isArray(raw)) {
        return raw.length > 0;
      }

      return Object.keys(raw).length > 0;
    }

    return false;
  }

  get impactSummary(): string {
    const raw = this.rawImpact;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      const summary = obj['summary'] || obj['description'];
      if (typeof summary === 'string' && summary.trim().length > 0) {
        return summary.trim();
      }
    }

    return '';
  }

  get impactPoints(): string[] {
    return extractStringList(this.rawImpact, ['points', 'bullets', 'unlocks']);
  }

  get mitreAttack(): { code: string; name: string } | null {
    const raw = this.rawImpact;
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      const attack = (obj['mitre_attack'] ||
        obj['mitreAttack'] ||
        obj['mitre']) as Record<string, unknown> | undefined;
      if (
        attack &&
        typeof attack['code'] === 'string' &&
        typeof attack['name'] === 'string'
      ) {
        return {
          code: attack['code'].trim(),
          name: attack['name'].trim(),
        };
      }
    }

    return null;
  }

  get rawBusinessRisk(): unknown {
    return (
      this.finding?.businessRisk ||
      this.finding?.detail?.['business_risk'] ||
      (this.finding as unknown as Record<string, unknown>)?.['business_risk']
    );
  }

  get hasBusinessRisk() {
    const raw = this.rawBusinessRisk;
    if (!raw) {
      return false;
    }
    if (typeof raw === 'string') {
      return raw.trim().length > 0;
    }
    if (typeof raw === 'object') {
      if (Array.isArray(raw)) {
        return raw.length > 0;
      }

      return Object.keys(raw).length > 0;
    }

    return false;
  }

  get businessRiskSummary(): string {
    const raw = this.rawBusinessRisk;
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      const summary = obj['summary'] || obj['description'];
      if (typeof summary === 'string' && summary.trim().length > 0) {
        return summary.trim();
      }
    } else if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }

    return '';
  }

  get businessRisks(): string[] {
    return extractStringList(this.rawBusinessRisk, [
      'points',
      'risks',
      'bullets',
    ]);
  }

  get scoringFactors(): ScoringFactor[] {
    const score = this.scoreNumber;
    const totalDeduction = 100 - score;

    // Distribute deductions realistically
    const d1 = Math.min(40, totalDeduction);
    const d2 = Math.min(25, Math.max(0, totalDeduction - d1));
    const d3 = Math.min(15, Math.max(0, totalDeduction - d1 - d2));
    const d4 = Math.max(0, totalDeduction - d1 - d2 - d3);

    return [
      {
        title: 'Base score',
        desc: 'Every check starts at full resilience.',
        points: '100',
        isBase: true,
      },
      {
        title: 'Defeated by a generic technique',
        desc: 'A publicly known runtime hook clears the guard — no bespoke work needed.',
        points: `−${d1}`,
        isMinus: true,
      },
      {
        title: 'No app-specific knowledge required',
        desc: 'The bypass ignores app internals entirely.',
        points: `−${d2}`,
        isMinus: true,
      },
      {
        title: 'Single-layer check',
        desc: 'One flag lookup, with no cross-checks or aggregation to fall back on.',
        points: `−${d3}`,
        isMinus: true,
      },
      {
        title: 'Bypass reproduced & verified',
        desc: 'Confirmed on a clean run by an independent screen verifier.',
        points: `−${d4}`,
        isMinus: true,
      },
    ];
  }

  @action
  openDrawer(): void {
    this.isDrawerOpen = true;
  }

  @action
  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  @action
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isDrawerOpen) {
      this.closeDrawer();
    }
  }

  @action
  toggleEarlierAttempts(): void {
    this.showEarlierAttempts = !this.showEarlierAttempts;
  }

  @action
  async copyExploit(): Promise<void> {
    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(this.exploitScript);
        this.isExploitCopied = true;
        setTimeout(() => {
          this.isExploitCopied = false;
        }, 1600);
      } catch {
        // Clipboard API writeText failed, fall back to textarea copy
        this.fallbackCopy(this.exploitScript);
      }
    }
  }

  async triggerFileDownload(url: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          link.remove();
          URL.revokeObjectURL(blobUrl);
        }, 100);

        return;
      }
    } catch {
      // Direct fetch failed (e.g. CORS restriction)
    }

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
    }, 100);
  }

  downloadPatchedApk = task({ drop: true }, async () => {
    const serverName = this.patchedApkServerName;
    const fileName = this.patchedApkName;
    const scanId = this.scanId;
    if (!fileName || !scanId) {
      return;
    }
    try {
      let url: string | undefined;
      try {
        const adapter = this.store.adapterFor(
          'offsec-scan'
        ) as unknown as OffsecScanAdapter;
        const details = await adapter.fetchArtifactDownloadUrl(
          'offsec-scan',
          scanId,
          serverName,
          fileName
        );
        url = details?.download_url || details?.url;
      } catch {
        // Fallback to embedded URL if adapter fails
      }

      if (!url) {
        const raw = this.finding?.detail?.['patched_apk'];
        if (raw && typeof raw === 'object') {
          url =
            ((raw as Record<string, unknown>)['download_url'] as string) ||
            ((raw as Record<string, unknown>)['url'] as string);
        }
      }

      if (!url && this.scan?.artifacts) {
        const matched = this.scan.artifacts.find(
          (a) =>
            a.name === serverName ||
            a.name === fileName ||
            a.name === 'patched.apk'
        );
        url = matched?.download_url;
      }

      if (url) {
        await this.triggerFileDownload(url, fileName);
      } else {
        throw new Error('No download URL returned');
      }
    } catch (error) {
      this.notify?.error?.(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  @action
  triggerApkDownload(): void {
    this.downloadPatchedApk.perform();
  }

  @action
  async copyPayload(text: string, id: string | number): Promise<void> {
    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        this.copiedPayloadId = id;
        setTimeout(() => {
          this.copiedPayloadId = null;
        }, 1600);
      } catch {
        // Clipboard API writeText failed, fall back to textarea copy
        this.fallbackCopy(text);
      }
    }
  }

  private fallbackCopy(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      // Legacy fallback when Clipboard API is unavailable
      (
        document as unknown as {
          execCommand: (cmd: string) => boolean;
        }
      ).execCommand('copy');
    } catch {
      // Fallback copy failed
    }
    textArea.remove();
  }

  @action
  formatPayload(content: unknown): string {
    if (!content) {
      return '';
    }

    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);

        return JSON.stringify(parsed, null, 2);
      } catch {
        return content;
      }
    }

    try {
      return JSON.stringify(content, null, 2);
    } catch {
      if (typeof content === 'number' || typeof content === 'boolean') {
        return String(content);
      }

      return '';
    }
  }

  get scanId(): string | undefined {
    const findingRecord = this.finding as unknown as Record<string, unknown>;

    return (
      this.args.scanId ||
      (typeof findingRecord?.['scan_id'] === 'string'
        ? findingRecord['scan_id']
        : undefined) ||
      (typeof findingRecord?.['scanId'] === 'string'
        ? findingRecord['scanId']
        : undefined)
    );
  }

  get scanName(): string {
    return (
      this.scan?.displayName || (this.scanId ? `Scan ${this.scanId}` : 'Scan')
    );
  }

  @action
  goToHome(): void {
    this.router.transitionTo('authenticated.offensive-security.index');
  }

  @action
  goBackToScan(): void {
    const scanId = this.scanId;
    if (scanId) {
      this.router.transitionTo('authenticated.offensive-security.scan', scanId);
    } else {
      window.history.back();
    }
  }

  loadFinding = task(
    { drop: true },
    async (findingId: string, options?: { reload?: boolean }) => {
      try {
        const cachedFinding = !options?.reload
          ? (this.store.peekRecord(
              'offsec-finding',
              findingId
            ) as OffsecFindingModel | null)
          : null;

        if (cachedFinding) {
          this.finding = cachedFinding;
        } else {
          this.finding = (await this.store.findRecord(
            'offsec-finding',
            findingId,
            options?.reload ? { reload: true } : undefined
          )) as OffsecFindingModel;
        }

        if (!this.scan && this.scanId) {
          this.scan = this.store.peekRecord('offsec-scan', this.scanId);
        }
      } catch (error) {
        this.notify?.error?.(parseError(error, this.intl.t('pleaseTryAgain')));
        this.goBackToScan();
      }
    }
  );
}

function extractStringList(
  raw: unknown,
  candidateKeys: string[] = []
): string[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  let candidates: unknown[] = [];
  if (Array.isArray(raw)) {
    candidates = raw;
  } else {
    const obj = raw as Record<string, unknown>;
    for (const key of candidateKeys) {
      if (Array.isArray(obj[key])) {
        candidates = obj[key] as unknown[];
        break;
      }
    }
  }

  return candidates
    .filter(
      (item): item is string =>
        typeof item === 'string' && item.trim().length > 0
    )
    .map((item) => item.trim());
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::FindingDetail': typeof OffensiveSecurityFindingDetailComponent;
    'offensive-security/finding-detail': typeof OffensiveSecurityFindingDetailComponent;
  }
}
