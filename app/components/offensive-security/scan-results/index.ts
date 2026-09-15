import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { OFFSEC_SAMPLE_LOG_LINES } from 'irene/utils/offsec-sample-log';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type { OffsecScanArtifact } from 'irene/models/offsec-scan';
import type OffsecScanAdapter from 'irene/adapters/offsec-scan';
import type FileAdapter from 'irene/adapters/file';
import type PollService from 'irene/services/poll';
import type EventBusService from 'irene/services/event-bus';

const POLL_INTERVAL_MS = 5000;

export interface OffensiveSecurityScanResultsSignature {
  Args: {
    scanId: string;
  };
}

export default class OffensiveSecurityScanResultsComponent extends Component<OffensiveSecurityScanResultsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service declare poll: PollService;
  @service declare window: Window;
  @service declare eventBus: EventBusService;

  @tracked scan: OffsecScanModel | null = null;
  @tracked logLines: string[] = [];
  @tracked logLoadFailed = false;
  @tracked isFileDetailsExpanded = false;

  @action
  toggleFileDetails(): void {
    this.isFileDetailsExpanded = !this.isFileDetailsExpanded;
  }

  stopPolling?: () => void;

  constructor(
    owner: unknown,
    args: OffensiveSecurityScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.eventBus.on(
      'ws:offsec-scan:update',
      this,
      this.handleWsOffsecScanUpdate
    );

    this.loadScan.perform(args.scanId);
  }

  willDestroy(): void {
    super.willDestroy();

    this.eventBus.off(
      'ws:offsec-scan:update',
      this,
      this.handleWsOffsecScanUpdate
    );
    this.stopPolling?.();
  }

  @action
  handleWsOffsecScanUpdate(updatedScan: OffsecScanModel): void {
    if (updatedScan && String(updatedScan.id) === String(this.args.scanId)) {
      this.scan = updatedScan;
      if (updatedScan.isTerminal) {
        this.stopPolling?.();
        this.stopPolling = undefined;
        if (!this.hasLog && !this.scan.logAttempted) {
          this.loadLog.perform();
        }
      }
    }
  }

  get adapter(): OffsecScanAdapter {
    return this.store.adapterFor('offsec-scan');
  }

  get isLoading(): boolean {
    return this.loadScan.isRunning || !this.scan;
  }

  get findings() {
    return this.scan?.findingList ?? [];
  }

  get artifacts(): OffsecScanArtifact[] {
    return this.scan?.artifactList ?? [];
  }

  get formattedStatusReason(): string {
    const reason = this.scan?.statusReason;
    if (!reason) {
      return this.intl.t('offensiveSecurity.scanFailed');
    }
    const resilienceTitle =
      this.intl.t('offensiveSecurity.artifactDesc.resilience') ||
      'Risk rating + per-finding results';

    return reason.replaceAll('result.resilience.json', `"${resilienceTitle}"`);
  }

  get hasLog(): boolean {
    return this.logLines.length > 0;
  }

  @action
  handleFindingClick(findingId: number): void {
    this.router.transitionTo(
      'authenticated.offensive-security.finding',
      this.args.scanId,
      String(findingId)
    );
  }

  initiateStaticScanTask = task({ drop: true }, async () => {
    try {
      const targetFileId = String(
        this.scan?.fileId ??
          (this.scan as unknown as Record<string, unknown>)?.['file'] ??
          this.args.scanId
      );
      const fileAdapter = this.store.adapterFor('file') as FileAdapter;
      await fileAdapter.startStaticScan(targetFileId);

      if (this.scan) {
        this.scan.isStaticScanStarted = true;
        this.scan.staticScanStarted = true;
      }
      this.notify.success('Static scan initiated successfully!');
      this.loadScan.perform(this.args.scanId, { reload: true });
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  @action
  handleInitiateStaticScan(): void {
    this.initiateStaticScanTask.perform();
  }

  /**
   * Artifact and log URLs may arrive presigned on the artifact payload, or are fetched
   * at click time via the adapter.
   */
  downloadArtifact = task(
    { drop: true },
    async (artifactOrName: OffsecScanArtifact | string) => {
      try {
        const artifactName =
          typeof artifactOrName === 'string'
            ? artifactOrName
            : artifactOrName.name;

        let url: string | undefined;

        // Try adapter first to get fresh presigned download URL
        try {
          const res = await this.adapter.fetchArtifactDownloadUrl(
            'offsec-scan',
            this.args.scanId,
            artifactName
          );
          url = res?.url || res?.download_url || res?.log_url;
        } catch {
          // If adapter fetch fails, fallback to artifact download_url
        }

        // If not directly present from adapter, check passed object or scan artifacts
        if (!url) {
          if (typeof artifactOrName === 'object' && artifactOrName !== null) {
            url = artifactOrName.download_url;
          }
        }

        if (!url && this.scan?.artifacts) {
          const matched = this.scan.artifacts.find(
            (a) => a.name === artifactName
          );
          url = matched?.download_url;
        }

        if (!url) {
          throw new Error('No download URL returned');
        }

        await this.triggerFileDownload(url, artifactName);
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  async triggerFileDownload(url: string, fileName: string): Promise<void> {
    // 1. Try fetching as a blob first. If CORS allows it (e.g. in staging/prod or same-origin),
    // this creates an object URL and guarantees a direct file download with the correct fileName.
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
      // Direct fetch failed (e.g. CORS restriction on localhost)
    }

    // 2. Binary artifacts (.apk, .ipa, .zip):
    // Trigger download silently via hidden iframe so the page is not navigated and no new tab opens.
    const isBinary =
      fileName.endsWith('.apk') ||
      fileName.endsWith('.ipa') ||
      fileName.endsWith('.zip');

    if (isBinary) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.remove();
      }, 60000);

      return;
    }

    // 3. For non-binary artifacts, trigger download via anchor WITHOUT target='_blank'
    // so it never opens in a new tab.
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
    }, 1000);
  }

  loadScan = task(
    { drop: true },
    async (scanId: string, options?: { reload?: boolean }) => {
      try {
        const cached = !options?.reload
          ? (this.store.peekRecord(
              'offsec-scan',
              scanId
            ) as OffsecScanModel | null)
          : null;

        // A scan is only usable from cache if:
        // 1. It is terminal (completed or failed) - queued or running scans MUST remain live!
        // 2. Its detail payload has been fetched, i.e. `cached.findings !== undefined`
        const isFullyLoadedTerminalScan = Boolean(
          cached && cached.isTerminal && cached.findings !== undefined
        );

        if (isFullyLoadedTerminalScan && cached) {
          this.scan = cached;
        } else {
          this.scan = (await this.store.findRecord('offsec-scan', scanId, {
            reload: true,
          })) as OffsecScanModel;
        }

        if (this.scan.cachedLogLines?.length) {
          this.logLines = this.scan.cachedLogLines;
        }

        this.managePolling();

        if (this.scan.isQueued || this.scan.isRunning) {
          this.loadLogStream.perform();
        } else if (!this.hasLog && !this.scan.logAttempted) {
          this.loadLog.perform();
        }
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

        this.router.transitionTo('authenticated.offensive-security.index');
      }
    }
  );

  loadLogStream = task({ drop: true }, async () => {
    try {
      const res: Record<string, unknown> = (await this.adapter.fetchLogStream(
        'offsec-scan',
        this.args.scanId
      )) as unknown as Record<string, unknown>;

      const rawLogs: unknown = res['logs'] ?? res['lines'] ?? res;
      let lines: string[] = [];

      if (typeof rawLogs === 'string') {
        lines = rawLogs.split('\n').filter((l: string) => l.trim().length > 0);
      } else if (Array.isArray(rawLogs)) {
        lines = rawLogs as string[];
      }

      if (lines.length > 0) {
        this.logLines = lines;
        if (this.scan) {
          this.scan.cachedLogLines = lines;
        }
      }
      this.logLoadFailed = false;

      const statusVal = res['status'] ?? res['scan_status'] ?? res['state'];
      const rawStatusStr =
        typeof statusVal === 'string' || typeof statusVal === 'number'
          ? String(statusVal).toLowerCase()
          : '';

      const wasTerminal = this.scan?.isTerminal;
      const isNowTerminal =
        ['completed', 'failed', 'terminal', '3', '4'].includes(rawStatusStr) ||
        Boolean(wasTerminal);

      if (isNowTerminal) {
        this.stopPolling?.();
        this.stopPolling = undefined;

        // Only reload the scan if it was actively in progress and just transitioned
        // to terminal. If it was already terminal, loadScan just fetched the latest record.
        if (!wasTerminal) {
          this.scan = (await this.store.findRecord(
            'offsec-scan',
            this.args.scanId,
            {
              reload: true,
            }
          )) as OffsecScanModel;
          this.loadLog.perform();
        }
      }
    } catch {
      // Stream polling failed
    }
  });

  private async fetchRemoteLogLines(): Promise<string[]> {
    const res = await this.adapter.fetchLogUrl('offsec-scan', this.args.scanId);

    const targetUrl = res?.url || res?.log_url;

    if (!targetUrl) {
      throw new Error('No log URL returned');
    }

    if (this.scan) {
      this.scan.cachedLogUrl = targetUrl;
    }

    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error(`log fetch failed: ${response.status}`);
    }

    const text = await response.text();

    return text.split('\n').filter(Boolean);
  }

  private async fallbackLogStream(): Promise<boolean> {
    if (!this.scan?.isQueued && !this.scan?.isRunning) {
      return false;
    }

    try {
      await this.loadLogStream.perform();

      return this.logLines.length > 0;
    } catch {
      return false;
    }
  }

  private fallbackDevelopmentLog(): boolean {
    if (ENV.environment !== 'development') {
      return false;
    }

    this.logLines = this.scan?.isFailed ? [] : [...OFFSEC_SAMPLE_LOG_LINES];
    if (this.scan && this.logLines.length > 0) {
      this.scan.cachedLogLines = this.logLines;
    }

    return true;
  }

  loadLog = task({ drop: true }, async () => {
    if (this.scan?.cachedLogLines?.length) {
      this.logLines = this.scan.cachedLogLines;
      this.logLoadFailed = false;

      return;
    }

    if (this.scan?.isTerminal && this.scan.logAttempted) {
      return;
    }

    if (this.scan) {
      this.scan.logAttempted = true;
    }

    try {
      const lines = await this.fetchRemoteLogLines();

      this.logLines = lines;
      if (this.scan) {
        this.scan.cachedLogLines = lines;
      }
      this.logLoadFailed = false;
    } catch {
      if (await this.fallbackLogStream()) {
        this.logLoadFailed = false;

        return;
      }

      if (this.fallbackDevelopmentLog()) {
        return;
      }

      // A missing log is not worth a toast — the run's results are still usable.
      this.logLoadFailed = true;
    }
  });

  managePolling(): void {
    if (!this.scan || this.scan.isTerminal) {
      this.stopPolling?.();
      this.stopPolling = undefined;

      return;
    }

    if (this.stopPolling) {
      return;
    }

    this.stopPolling = this.poll.startPolling(
      () => this.loadLogStream.perform(),
      POLL_INTERVAL_MS
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults': typeof OffensiveSecurityScanResultsComponent;
    'offensive-security/scan-results': typeof OffensiveSecurityScanResultsComponent;
  }
}
