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
    return this.args.findings.length > 0;
  }

  /**
   * Bypassed protections first — the whole point of the run is what got through.
   */
  get sortedFindings(): OffsecScanEmbeddedFinding[] {
    const weight = (outcome: string) =>
      ({ bypassed: 0, error: 1, resisted: 2, not_attempted: 3 })[outcome] ?? 4;

    return [...this.args.findings].sort(
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
