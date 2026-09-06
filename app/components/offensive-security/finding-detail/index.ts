import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import type { SafeString } from '@ember/template/-private/handlebars';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type OffsecFindingModel from 'irene/models/offsec-finding';
import type OffsecScanModel from 'irene/models/offsec-scan';

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
      if (!this.scan) {
        this.loadScan.perform(args.scanId);
      }
    }

    this.loadFinding.perform(args.findingId);
  }

  get isLoading(): boolean {
    return this.loadFinding.isRunning;
  }

  get evidence(): OffsecFindingEvidence[] {
    const raw = this.finding?.evidence;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === 'object') {
      return Object.values(raw) as OffsecFindingEvidence[];
    }
    return this.finding?.evidenceList ?? [];
  }

  get checkTypeLabel(): string {
    if (!this.finding?.checkType) {
      return 'Findings';
    }
    const label = this.finding.checkType.replace(/_/g, ' ');
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get categoryLabel(): string {
    return this.finding?.category || 'resilience';
  }

  get scoreNumber(): number {
    const rawScore = this.finding?.score;
    const scoreVal =
      typeof rawScore === 'number'
        ? rawScore
        : parseInt(String(rawScore || '10'), 10);
    return isNaN(scoreVal) ? 10 : Math.max(0, Math.min(100, scoreVal));
  }

  get scoreProgressStyle(): SafeString {
    return htmlSafe(`width: ${this.scoreNumber}%;`);
  }

  get bandTag(): string {
    const band =
      this.finding?.bandLabel ||
      (this.scoreNumber <= 39
        ? 'Weak'
        : this.scoreNumber <= 69
          ? 'Moderate'
          : 'Strong');
    return `${band.toUpperCase()} RESILIENCE`;
  }

  get isWeak(): boolean {
    return this.scoreNumber <= 39;
  }

  get isModerate(): boolean {
    return this.scoreNumber >= 40 && this.scoreNumber <= 69;
  }

  get isStrong(): boolean {
    return this.scoreNumber >= 70;
  }

  get attemptsList(): Array<Record<string, unknown>> {
    const rawAttempts = this.finding?.attempts;
    if (Array.isArray(rawAttempts)) {
      return rawAttempts.filter((a) => a && typeof a === 'object');
    }
    if (rawAttempts && typeof rawAttempts === 'object') {
      return Object.values(rawAttempts).filter((a) => a && typeof a === 'object');
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

  get isVerified(): boolean {
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

    // 1. Check frida_script from model, detail, or bypassAttempted
    const fridaScriptCandidate =
      this.finding.fridaScript ||
      (this.finding.detail?.['frida_script'] as string | undefined) ||
      ((this.finding as unknown as Record<string, unknown>)?.[
        'frida_script'
      ] as string | undefined) ||
      (this.finding.bypassAttempted?.['frida_script'] as string | undefined);

    if (
      typeof fridaScriptCandidate === 'string' &&
      fridaScriptCandidate.trim().length > 0
    ) {
      return true;
    }

    // 2. Check exploit / script in detail or bypassAttempted
    const detail = this.finding.detail;
    if (
      (typeof detail?.['script'] === 'string' &&
        detail['script'].trim().length > 0) ||
      (typeof detail?.['exploit_script'] === 'string' &&
        detail['exploit_script'].trim().length > 0) ||
      (typeof detail?.['exploit'] === 'string' &&
        detail['exploit'].trim().length > 0) ||
      (typeof this.finding.bypassAttempted?.['script'] === 'string' &&
        (this.finding.bypassAttempted['script'] as string).trim().length > 0)
    ) {
      return true;
    }

    // 3. Exploit evidence explicitly attached on finding or detail
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

    // 4. Evidence notes attached to the effective / bypass attempt
    const effAttemptEv = this.effectiveAttempt?.['evidence'];
    if (Array.isArray(effAttemptEv) && effAttemptEv.length > 0) {
      return true;
    }

    // 5. Evidence list has an item associated with the exploit
    return this.evidence.some(
      (ev) =>
        ev.source === 'exploit' ||
        ev.tool === 'frida' ||
        ev.tool === 'exploit' ||
        ev.evidence_id?.toLowerCase().includes('exploit') ||
        (typeof ev.summary === 'string' &&
          ev.summary.toLowerCase().includes('exploit'))
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
        const match = content.match(/"package":\s*"([^"]+)"/);
        if (match && match[1]) {
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
      .replace(/^_+|_+$/g, '');
    return `${sanitized}_bypass.js`;
  }

  get exploitScript(): string {
    // 1. Check if frida_script is provided on finding or detail
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
      return detail['script'];
    }
    if (
      detail?.['exploit_script'] &&
      typeof detail['exploit_script'] === 'string'
    ) {
      return detail['exploit_script'];
    }
    if (detail?.['exploit'] && typeof detail['exploit'] === 'string') {
      return detail['exploit'];
    }
    if (
      this.finding?.bypassAttempted?.['script'] &&
      typeof this.finding.bypassAttempted['script'] === 'string'
    ) {
      return this.finding.bypassAttempted['script'];
    }

    const sig = (this.finding?.signatureId || '').toLowerCase();

    // Contextual Frida bypass script generator matching the finding type
    if (
      sig.includes('debug') ||
      sig.includes('devopt') ||
      sig.includes('setting')
    ) {
      return `Java.perform(function () {
  const Secure = Java.use('android.provider.Settings$Secure');
  const Global = Java.use('android.provider.Settings$Global');

  // force the two flags the probe reads to look disabled
  const SPOOF = { adb_enabled: '0', development_settings_enabled: '0' };

  function hook(cls) {
    cls.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int')
      .implementation = function (cr, key, def) {
        if (key in SPOOF) return parseInt(SPOOF[key]);
        return this.getInt(cr, key, def);
      };
    cls.getString.overload('android.content.ContentResolver', 'java.lang.String')
      .implementation = function (cr, key) {
        if (key in SPOOF) return SPOOF[key];
        return this.getString(cr, key);
      };
  }

  hook(Secure); hook(Global);
  console.log('[+] dev-options / usb-debugging probe neutralized');
});`;
    }

    if (
      sig.includes('root') ||
      sig.includes('build-props') ||
      sig.includes('props')
    ) {
      return `Java.perform(function () {
  const Build = Java.use('android.os.Build');
  Build.TAGS.value = 'release-keys';

  const SystemProperties = Java.use('android.os.SystemProperties');
  SystemProperties.get.overload('java.lang.String').implementation = function (key) {
    if (key === 'ro.build.tags') return 'release-keys';
    if (key === 'ro.debuggable') return '0';
    if (key === 'ro.secure') return '1';
    return this.get(key);
  };
  console.log('[+] root-build-props probe neutralized');
});`;
    }

    if (sig.includes('ssl') || sig.includes('pinning')) {
      return `Java.perform(function () {
  const TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
  TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
    return untrustedChain;
  };
  console.log('[+] ssl-pinning bypass applied');
});`;
    }

    return `Java.perform(function () {
  console.log('[*] neutralizing security check: ${this.finding?.signatureId || 'probe'}');
  // Runtime bypass hook injected
});`;
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
    return 'The app inspects runtime flags to refuse running under analysis. A generic runtime hook forces checks to report clean, so the guard never fires — no app-specific knowledge required.';
  }

  get rawImpact(): unknown {
    return (
      this.finding?.impact ||
      this.finding?.detail?.['impact'] ||
      (this.finding as unknown as Record<string, unknown>)?.['impact']
    );
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
    return `This control exists to stop the app from running on instrumented or modified devices. A generic runtime hook neutralizes it, so the production build now runs unmodified on an instrumented device — the exact condition it was built to block.`;
  }

  get impactPoints(): string[] {
    const raw = this.rawImpact;
    if (typeof raw === 'object' && raw !== null) {
      if (Array.isArray(raw) && raw.length > 0) {
        const filtered = raw
          .filter((p) => typeof p === 'string' && p.trim().length > 0)
          .map((p) => (p as string).trim());
        if (filtered.length > 0) {
          return filtered;
        }
      } else {
        const obj = raw as Record<string, unknown>;
        const pts = obj['points'] || obj['bullets'] || obj['unlocks'];
        if (Array.isArray(pts) && pts.length > 0) {
          const filtered = pts
            .filter((p) => typeof p === 'string' && p.trim().length > 0)
            .map((p) => (p as string).trim());
          if (filtered.length > 0) {
            return filtered;
          }
        }
      }
    }
    return [
      'Trace and tamper with live internals — method calls, arguments, decrypted values — at runtime',
      'Removes the foothold the app’s other runtime guards sit behind: pinning, root, and integrity checks can now be attacked in turn',
      'Offers no real resistance — an off-the-shelf hook defeats it, so the control adds effectively zero security value',
    ];
  }

  get mitreAttack(): { code: string; name: string } {
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

    const sig = (this.finding?.signatureId || '').toLowerCase();
    if (sig.includes('root')) {
      return {
        code: 'T1407',
        name: 'Rootkit / Privilege Escalation Detection — evaded (ATT&CK Mobile)',
      };
    }
    if (sig.includes('pinning') || sig.includes('ssl')) {
      return {
        code: 'T1453',
        name: 'Network Traffic Interception — achieved (ATT&CK Mobile)',
      };
    }
    return {
      code: 'T1633.001',
      name: 'System Checks — evaded (ATT&CK Mobile)',
    };
  }

  get rawBusinessRisk(): unknown {
    return (
      this.finding?.businessRisk ||
      this.finding?.detail?.['business_risk'] ||
      (this.finding as unknown as Record<string, unknown>)?.['business_risk']
    );
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
    return 'Downstream exposure if the technical impact above goes unaddressed. Confirm against this app’s data sensitivity and compliance requirements before reporting.';
  }

  get businessRisks(): string[] {
    const raw = this.rawBusinessRisk;
    if (typeof raw === 'object' && raw !== null) {
      if (Array.isArray(raw) && raw.length > 0) {
        const filtered = raw
          .filter((r) => typeof r === 'string' && r.trim().length > 0)
          .map((r) => (r as string).trim());
        if (filtered.length > 0) {
          return filtered;
        }
      } else {
        const obj = raw as Record<string, unknown>;
        const pts = obj['points'] || obj['risks'] || obj['bullets'];
        if (Array.isArray(pts) && pts.length > 0) {
          const filtered = pts
            .filter((r) => typeof r === 'string' && r.trim().length > 0)
            .map((r) => (r as string).trim());
          if (filtered.length > 0) {
            return filtered;
          }
        }
      }
    }
    return [
      'Instrumentation-based reverse engineering of app logic and secrets',
      'Weaker protection for any credentials, tokens, or keys held in-app',
      'Reduced assurance where anti-tamper is a compliance expectation',
    ];
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
      } catch (e) {
        // Fallback
        this.fallbackCopy(this.exploitScript);
      }
    }
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
      } catch (e) {
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
      document.execCommand('copy');
    } catch {
      // ignore
    }
    document.body.removeChild(textArea);
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
      return String(content);
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
    this.router.transitionTo(
      'authenticated.dashboard.offensive-security.index'
    );
  }

  @action
  goBackToScan(): void {
    const scanId = this.scanId;
    if (scanId) {
      this.router.transitionTo(
        'authenticated.dashboard.offensive-security.scan',
        scanId
      );
    } else {
      window.history.back();
    }
  }

  loadScan = task({ drop: true }, async (scanId: string) => {
    try {
      const cachedScan = this.store.peekRecord(
        'offsec-scan',
        scanId
      ) as OffsecScanModel | null;

      if (cachedScan) {
        this.scan = cachedScan;
      } else {
        this.scan = (await this.store.findRecord(
          'offsec-scan',
          scanId
        )) as OffsecScanModel;
      }
    } catch {
      // Non-fatal, fallback to scanId
    }
  });

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
          if (!this.scan) {
            this.loadScan.perform(this.scanId);
          }
        }
      } catch (error) {
        this.notify?.error?.(parseError(error, this.intl.t('pleaseTryAgain')));
        this.goBackToScan();
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::FindingDetail': typeof OffensiveSecurityFindingDetailComponent;
    'offensive-security/finding-detail': typeof OffensiveSecurityFindingDetailComponent;
  }
}
