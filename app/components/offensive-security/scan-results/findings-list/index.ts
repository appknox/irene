import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { OffsecScanEmbeddedFinding } from 'irene/models/offsec-scan';

export interface FindingGroup {
  key: string;
  title: string;
  findings: OffsecScanEmbeddedFinding[];
}

export interface OffensiveSecurityScanResultsFindingsListSignature {
  Args: {
    findings: OffsecScanEmbeddedFinding[];
    onFindingClick: (findingId: number) => void;
  };
}

export default class OffensiveSecurityScanResultsFindingsListComponent extends Component<OffensiveSecurityScanResultsFindingsListSignature> {
  @tracked expandedGroups: Record<string, boolean> = {};

  get hasFindings(): boolean {
    return this.groupedFindings.length > 0;
  }

  @action
  isGroupExpanded(key: string): boolean {
    return Boolean(this.expandedGroups[key]);
  }

  formatGroupTitle(key: string): string {
    if (!key) {
      return '';
    }

    const acronyms: Record<string, string> = {
      ssl: 'SSL',
      tls: 'TLS',
      usb: 'USB',
      sdk: 'SDK',
      ocr: 'OCR',
      api: 'API',
      cwe: 'CWE',
      cve: 'CVE',
      apk: 'APK',
      ipa: 'IPA',
    };

    return key
      .split(/[-_/]+/)
      .filter(Boolean)
      .map((word) => {
        const lower = word.toLowerCase();
        if (acronyms[lower]) {
          return acronyms[lower];
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Groups findings by their key (e.g. "anti-debug-ptrace", "debug-settings-probe")
   * and formats the group title to Title Case ("Anti Debug Ptrace").
   * If a finding name contains '/', it is split into separate items in the list.
   */
  get groupedFindings(): FindingGroup[] {
    const weight = (outcome: string) =>
      ({ bypassed: 0, resisted: 1, error: 2 })[outcome] ?? 3;

    // Keep detected protections and attempted ones; drop only entries neither detected nor
    // attempted. A detected-but-untested finding belongs in the list with its unassessed badge.
    const activeFindings = (this.args.findings ?? []).filter(
      (finding) =>
        Boolean(finding.outcome) &&
        (finding.detected ||
          (finding.outcome !== 'not_attempted' &&
            finding.outcome !== 'unassessed'))
    );

    if (activeFindings.length === 0) {
      return [];
    }

    const groupMap = new Map<string, OffsecScanEmbeddedFinding[]>();

    for (const finding of activeFindings) {
      const groupKey =
        finding.group || finding.signature_id || finding.category || 'other';

      const rawName =
        finding.name || this.formatGroupTitle(finding.signature_id || '');
      const nameParts = rawName.includes('/')
        ? rawName
            .split('/')
            .map((p) => p.trim())
            .filter(Boolean)
        : [rawName];

      const splitFindings: OffsecScanEmbeddedFinding[] =
        nameParts.length > 1
          ? nameParts.map((partName, partIdx) => ({
              ...finding,
              name: partName,
              order: (finding.order ?? 0) + partIdx * 0.1,
            }))
          : [finding];

      const existing = groupMap.get(groupKey);
      if (existing) {
        existing.push(...splitFindings);
      } else {
        groupMap.set(groupKey, [...splitFindings]);
      }
    }

    const groups: FindingGroup[] = [];

    for (const [key, list] of groupMap.entries()) {
      const sortedInGroup = list.sort(
        (a, b) =>
          weight(a.outcome) - weight(b.outcome) ||
          (a.order ?? 0) - (b.order ?? 0)
      );

      groups.push({
        key,
        title: this.formatGroupTitle(key),
        findings: sortedInGroup,
      });
    }

    return groups;
  }

  get sortedFindings(): OffsecScanEmbeddedFinding[] {
    return this.groupedFindings.flatMap((group) => group.findings);
  }

  @action
  toggleGroup(key: string): void {
    const isExpanded = this.isGroupExpanded(key);
    this.expandedGroups = {
      ...this.expandedGroups,
      [key]: !isExpanded,
    };
  }

  @action
  handleGroupKeydown(key: string, event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.toggleGroup(key);
  }

  /**
   * The status a finding's badge shows. A not-yet-bypassed check splits on whether it fired at
   * runtime: `triggered` (its mechanism fired, it has a backtrace) versus `not_attempted`
   * (detected only statically, never fired). Bypassed/resisted/error keep their own outcome.
   */
  @action
  statusKey(finding: OffsecScanEmbeddedFinding): string {
    const outcome = finding.outcome || '';
    if (
      outcome === 'bypassed' ||
      outcome === 'resisted' ||
      outcome === 'error'
    ) {
      return outcome;
    }
    if (finding.triggered) {
      return 'triggered';
    }
    return outcome || 'not_attempted';
  }

  @action
  outcomeClass(outcome: string): string {
    switch (outcome) {
      case 'bypassed':
        return 'exploited';
      case 'resisted':
        return 'defended';
      case 'triggered':
        return 'detected';
      case 'not_attempted':
      case 'unassessed':
        return 'neutral';
      case 'error':
        return 'errored';
      default:
        return 'neutral';
    }
  }

  @action
  handleClick(findingId: number): void {
    this.args.onFindingClick(findingId);
  }

  /** Keyboard equivalent of clicking a row — the row is not a real button. */
  @action
  handleKeydown(findingId: number, event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.handleClick(findingId);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::FindingsList': typeof OffensiveSecurityScanResultsFindingsListComponent;
  }
}
