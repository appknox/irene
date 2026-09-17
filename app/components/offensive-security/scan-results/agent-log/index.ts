import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
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
  @tracked isExpanded = false;
  @tracked isScrolledUp = false;

  private readonly dotsTimer?: ReturnType<typeof setInterval>;
  private logPaneElement: HTMLElement | null = null;
  private shouldAutoScroll = true;

  constructor(
    owner: unknown,
    args: OffensiveSecurityScanResultsAgentLogSignature['Args']
  ) {
    super(owner, args);

    this.dotsTimer = setInterval(() => {
      this.dotCount = (this.dotCount % 3) + 1;
    }, 500);

    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  willDestroy(): void {
    super.willDestroy();
    if (this.dotsTimer) {
      clearInterval(this.dotsTimer);
    }
    window.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.body.style.overflow = '';
  }

  @action
  handleDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isExpanded) {
      event.preventDefault();
      this.toggleExpand();
    }
  }

  @action
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    requestAnimationFrame(() => {
      if (this.shouldAutoScroll) {
        this.scrollToBottom();
      }
    });
  }

  @action
  setupLogPane(element: HTMLElement): void {
    this.logPaneElement = element;
    this.scrollToBottom();
  }

  @action
  handleScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) {
      return;
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.shouldAutoScroll = distanceFromBottom < 60;
    this.isScrolledUp = distanceFromBottom >= 60;
  }

  @action
  handleLinesUpdated(): void {
    if (this.shouldAutoScroll) {
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    }
  }

  @action
  scrollNav(): void {
    if (this.isScrolledUp) {
      // Currently scrolled up → jump to bottom (latest)
      this.shouldAutoScroll = true;
      this.isScrolledUp = false;
      this.scrollToBottom();
    } else {
      // Already at bottom → scroll to top
      if (this.logPaneElement) {
        this.logPaneElement.scrollTop = 0;
      }
    }
  }

  scrollToBottom(): void {
    if (this.logPaneElement) {
      this.logPaneElement.scrollTop = this.logPaneElement.scrollHeight;
    }
  }

  get dotsText() {
    return '.'.repeat(this.dotCount);
  }

  /**
   * Colour the transcript by shape. This is presentation only — the agent emits
   * plain text, so a missed match costs nothing but a grey line.
   */
  get styledLines(): AgentLogLine[] {
    const lines = this.args.lines ?? [];

    return lines.map((text) => ({ text, tone: toneFor(text) }));
  }

  get statusMessage() {
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

  get showInProgress() {
    return (
      (this.args.scan?.isInProgress ?? false) && this.styledLines.length === 0
    );
  }

  get showEmptyState() {
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

  if (/(?:^done\.)|✓|success|complete/i.test(line)) {
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
