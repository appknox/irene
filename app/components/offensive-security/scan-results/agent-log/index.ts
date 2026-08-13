import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface AgentLogLine {
  text: string;
  tone: 'accent' | 'error' | 'success' | 'dim' | '';
}

export interface OffensiveSecurityScanResultsAgentLogSignature {
  Args: {
    scan: OffsecScanModel;
    lines: string[];
    loadFailed?: boolean;
    isLoading?: boolean;
  };
}

export default class OffensiveSecurityScanResultsAgentLogComponent extends Component<OffensiveSecurityScanResultsAgentLogSignature> {
  /**
   * Colour the transcript by shape. This is presentation only — the agent emits
   * plain text, so a missed match costs nothing but a grey line.
   */
  get styledLines(): AgentLogLine[] {
    return this.args.lines.map((text) => ({ text, tone: toneFor(text) }));
  }

  get showInProgress(): boolean {
    return this.args.scan.isInProgress;
  }

  get showEmptyState(): boolean {
    return (
      !this.showInProgress &&
      !this.args.isLoading &&
      this.args.lines.length === 0
    );
  }
}

function toneFor(line: string): AgentLogLine['tone'] {
  if (/^\$\s/.test(line)) {
    return 'accent';
  }

  if (/error|failed|exception/i.test(line)) {
    return 'error';
  }

  if (/^done\.|✓|success|complete/i.test(line)) {
    return 'success';
  }

  if (/^\[|^\s{2,}/.test(line)) {
    return 'dim';
  }

  return '';
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::AgentLog': typeof OffensiveSecurityScanResultsAgentLogComponent;
  }
}
