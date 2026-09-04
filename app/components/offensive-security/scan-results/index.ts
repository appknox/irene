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
import {
  OFFSEC_SAMPLE_LOG_LINES,
  OFFSEC_FAILED_LOG_LINES,
} from 'irene/utils/offsec-sample-log';
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
        if (!this.hasLog) {
          this.loadLog.perform();
        }
      }
    }
  }

  get adapter(): OffsecScanAdapter {
    return this.store.adapterFor('offsec-scan');
  }

  get isLoading(): boolean {
    return this.loadScan.isRunning && !this.scan;
  }

  get findings() {
    return this.scan?.findingList ?? [];
  }

  get artifacts(): OffsecScanArtifact[] {
    return this.scan?.artifactList ?? [];
  }

  get hasLog(): boolean {
    return this.logLines.length > 0;
  }

  @action
  handleFindingClick(findingId: number): void {
    this.router.transitionTo(
      'authenticated.dashboard.offensive-security.finding',
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
      this.loadScan.perform(this.args.scanId);
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  @action
  handleInitiateStaticScan(): void {
    this.initiateStaticScanTask.perform();
  }

  /**
   * Artifact and log URLs are presigned and expire in an hour, so they are fetched
   * at click time rather than rendered into the page.
   */
  downloadArtifact = task({ drop: true }, async (artifactName: string) => {
    try {
      const { url } = await this.adapter.fetchArtifactDownloadUrl(
        'offsec-scan',
        this.args.scanId,
        artifactName
      );

      if (!url) {
        throw new Error('No download URL returned');
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = artifactName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch {
        const link = document.createElement('a');
        link.href = url;
        link.download = artifactName;
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  loadScan = task({ drop: true }, async (scanId: string) => {
    try {
      this.scan = (await this.store.findRecord('offsec-scan', scanId, {
        reload: true,
      })) as OffsecScanModel;

      this.managePolling();

      if (this.scan.isCompleted) {
        if (!this.hasLog) {
          this.loadLog.perform();
        }
      } else {
        this.loadLogStream.perform();
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      this.router.transitionTo(
        'authenticated.dashboard.offensive-security.index'
      );
    }
  });

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
      }
      this.logLoadFailed = false;

      const rawStatusStr = String(
        res['status'] ?? res['scan_status'] ?? res['state'] ?? ''
      ).toLowerCase();

      if (
        ['completed', 'failed', 'terminal', '3', '4'].includes(rawStatusStr) ||
        (this.scan && this.scan.isTerminal)
      ) {
        this.stopPolling?.();
        this.stopPolling = undefined;
        this.scan = (await this.store.findRecord(
          'offsec-scan',
          this.args.scanId,
          {
            reload: true,
          }
        )) as OffsecScanModel;
      }
    } catch {
      if (ENV.environment === 'development' && this.logLines.length === 0) {
        if (this.scan?.isFailed) {
          this.logLines = [...OFFSEC_FAILED_LOG_LINES];
        }
      }
    }
  });

  loadLog = task({ drop: true }, async () => {
    try {
      const { url } = await this.adapter.fetchLogUrl(
        'offsec-scan',
        this.args.scanId
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`log fetch failed: ${response.status}`);
      }

      const text = await response.text();

      this.logLines = text.split('\n').filter(Boolean);
      this.logLoadFailed = false;
    } catch {
      if (ENV.environment === 'development') {
        this.logLines = this.scan?.isFailed
          ? [...OFFSEC_FAILED_LOG_LINES]
          : [...OFFSEC_SAMPLE_LOG_LINES];
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
