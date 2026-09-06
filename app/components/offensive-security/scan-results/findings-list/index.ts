import Component from '@glimmer/component';
import { action } from '@ember/object';

import type { OffsecScanEmbeddedFinding } from 'irene/models/offsec-scan';

export interface OffensiveSecurityScanResultsFindingsListSignature {
  Args: {
    findings: OffsecScanEmbeddedFinding[];
    onFindingClick: (findingId: number) => void;
  };
}

export default class OffensiveSecurityScanResultsFindingsListComponent extends Component<OffensiveSecurityScanResultsFindingsListSignature> {
  get hasFindings(): boolean {
    return this.sortedFindings.length > 0;
  }

  /**
   * Bypassed protections first — the whole point of the run is what got through.
   * Unassessed checks (not attempted) are excluded because they are static checks
   * not confirmed to exist in the application.
   */
  get sortedFindings(): OffsecScanEmbeddedFinding[] {
    const weight = (outcome: string) =>
      ({ bypassed: 0, resisted: 1, error: 2 })[outcome] ?? 3;

    return (this.args.findings ?? [])
      .filter(
        (finding) =>
          finding.outcome !== 'not_attempted' &&
          finding.outcome !== 'unassessed' &&
          Boolean(finding.outcome)
      )
      .sort(
        (a, b) => weight(a.outcome) - weight(b.outcome) || a.order - b.order
      );
  }

  @action
  outcomeClass(outcome: string): string {
    switch (outcome) {
      case 'bypassed':
        return 'exploited';
      case 'resisted':
        return 'defended';
      case 'not_attempted':
        return 'detected';
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
