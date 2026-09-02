import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { OFFSEC_FAILED_LOG_LINES } from 'irene/utils/offsec-sample-log';
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
  @tracked dotCount = 1;
  private dotsTimer?: ReturnType<typeof setInterval>;

  constructor(
    owner: unknown,
    args: OffensiveSecurityScanResultsAgentLogSignature['Args']
  ) {
    super(owner, args);

    this.dotsTimer = setInterval(() => {
      this.dotCount = (this.dotCount % 3) + 1;
    }, 500);
  }

  willDestroy(): void {
    super.willDestroy();
    if (this.dotsTimer) {
      clearInterval(this.dotsTimer);
    }
  }

  get dotsText(): string {
    return '.'.repeat(this.dotCount);
  }

  /**
   * Colour the transcript by shape. This is presentation only — the agent emits
   * plain text, so a missed match costs nothing but a grey line.
   */
  get styledLines(): AgentLogLine[] {
    let lines = [...(this.args.lines ?? [])];

    if (this.args.scan?.isFailed) {
      const lastLine = lines[lines.length - 1] ?? '';
      if (!/failed/i.test(lastLine)) {
        lines.push(...OFFSEC_FAILED_LOG_LINES);
      }
    }

    return lines.map((text) => ({ text, tone: toneFor(text) }));
  }

  get statusMessage(): string {
    const scan = this.args.scan;
    if (scan?.isNotStarted) {
      return 'Not Started';
    }
    if (scan?.isQueued) {
      return 'Scan Queued';
    }
    if (scan?.isRunning) {
      return 'Log loading';
    }
    return 'Log loading';
  }

  get showInProgress(): boolean {
    return (
      (this.args.scan?.isInProgress ?? false) && this.styledLines.length === 0
    );
  }

  get showEmptyState(): boolean {
    return (
      !(this.args.scan?.isInProgress ?? false) &&
      !this.args.isLoading &&
      this.styledLines.length === 0
    );
  }
}

function toneFor(line: string): AgentLogLine['tone'] {
  if (/^\$\s/.test(line)) {
    return 'accent';
  }

  if (/^✗\s/.test(line)) {
    return 'dim';
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
