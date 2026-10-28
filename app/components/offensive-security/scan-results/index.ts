import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import { htmlSafe } from '@ember/template';
import type { SafeString } from '@ember/template/-private/handlebars';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type { OffsecScanArtifact } from 'irene/models/offsec-scan';
import type OffsecScanAdapter from 'irene/adapters/offsec-scan';
import type FileAdapter from 'irene/adapters/file';
import type PollService from 'irene/services/poll';
import type EventBusService from 'irene/services/event-bus';
import type DevicefarmService from 'irene/services/devicefarm';

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
  @service declare eventBus: EventBusService;
  @service declare devicefarm: DevicefarmService;

  @tracked scan: OffsecScanModel | null = null;
  @tracked logLines: string[] = [];
  @tracked logLoadFailed = false;
  @tracked isFileDetailsExpanded = false;
  @tracked activeScreenUrl: string | null = null;
  @tracked activeScreenPassword: string | null = null;
  @tracked isDeviceExpanded = false;
  @tracked deviceAspectRatio: number | null = null;

  private deviceObserver: MutationObserver | null = null;
  private canvasMutationObserver: MutationObserver | null = null;
  private canvasResizeObserver: ResizeObserver | null = null;
  private canvasPollTimer: number | null = null;

  @action
  setupDeviceObserver(wrapperElement: HTMLElement): void {
    this.teardownDeviceObserver();

    const checkCanvas = () => {
      const canvas = wrapperElement.querySelector('canvas');
      if (canvas) {
        const width = canvas.width;
        const height = canvas.height;
        if (width > 0 && height > 0) {
          const ar = width / height;
          if (
            Number.isFinite(ar) &&
            ar > 0 &&
            Math.abs((this.deviceAspectRatio ?? 0) - ar) > 0.001
          ) {
            this.deviceAspectRatio = ar;
          }
        }
      }
    };

    checkCanvas();

    if (typeof MutationObserver !== 'undefined') {
      this.deviceObserver = new MutationObserver(() => {
        checkCanvas();
        const canvas = wrapperElement.querySelector('canvas');
        if (canvas && !this.canvasMutationObserver) {
          this.canvasMutationObserver = new MutationObserver(checkCanvas);
          this.canvasMutationObserver.observe(canvas, {
            attributes: true,
            attributeFilter: ['width', 'height'],
          });
        }
      });

      this.deviceObserver.observe(wrapperElement, {
        childList: true,
        subtree: true,
      });

      const existingCanvas = wrapperElement.querySelector('canvas');
      if (existingCanvas) {
        this.canvasMutationObserver = new MutationObserver(checkCanvas);
        this.canvasMutationObserver.observe(existingCanvas, {
          attributes: true,
          attributeFilter: ['width', 'height'],
        });
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.canvasResizeObserver = new ResizeObserver(checkCanvas);
      this.canvasResizeObserver.observe(wrapperElement);
    }

    let pollCount = 0;
    this.canvasPollTimer = window.setInterval(() => {
      checkCanvas();
      pollCount++;
      if (this.deviceAspectRatio || pollCount > 30) {
        if (this.canvasPollTimer !== null) {
          clearInterval(this.canvasPollTimer);
          this.canvasPollTimer = null;
        }
      }
    }, 300);
  }

  @action
  teardownDeviceObserver(): void {
    if (this.deviceObserver) {
      this.deviceObserver.disconnect();
      this.deviceObserver = null;
    }
    if (this.canvasMutationObserver) {
      this.canvasMutationObserver.disconnect();
      this.canvasMutationObserver = null;
    }
    if (this.canvasResizeObserver) {
      this.canvasResizeObserver.disconnect();
      this.canvasResizeObserver = null;
    }
    if (this.canvasPollTimer !== null) {
      clearInterval(this.canvasPollTimer);
      this.canvasPollTimer = null;
    }
    this.deviceAspectRatio = null;
  }

  get isIosDevice(): boolean {
    return this.scan?.platform === 'ios';
  }

  get phoneFrameStyle(): SafeString | undefined {
    if (!this.deviceAspectRatio) {
      return undefined;
    }

    const ar = this.deviceAspectRatio;
    const bezel = this.phoneBezel;
    let innerHeight = bezel.targetInnerHeight;
    let innerWidth = Math.round(innerHeight * ar);

    if (innerWidth > bezel.maxInnerWidth) {
      innerWidth = bezel.maxInnerWidth;
      innerHeight = Math.round(innerWidth / ar);
    }

    const frameWidth = innerWidth + bezel.horizontal;
    const frameHeight = innerHeight + bezel.vertical;

    return htmlSafe(`width: ${frameWidth}px; height: ${frameHeight}px;`);
  }

  // Space the frame adds around the stream; mirrors the bezel sizes in index.scss
  get phoneBezel() {
    if (this.isIosDevice) {
      // 5px (6px expanded) metal padding on every side; the island overlays the screen
      return this.isDeviceExpanded
        ? {
            horizontal: 12,
            vertical: 12,
            targetInnerHeight: 558,
            maxInnerWidth: 310,
          }
        : {
            horizontal: 10,
            vertical: 10,
            targetInnerHeight: 470,
            maxInnerWidth: 260,
          };
    }

    // 6px (7px expanded) border plus a 13px speaker slit and 2px bottom padding
    return this.isDeviceExpanded
      ? {
          horizontal: 14,
          vertical: 29,
          targetInnerHeight: 541,
          maxInnerWidth: 310,
        }
      : {
          horizontal: 12,
          vertical: 27,
          targetInnerHeight: 448,
          maxInnerWidth: 260,
        };
  }

  @action
  toggleFileDetails(): void {
    this.isFileDetailsExpanded = !this.isFileDetailsExpanded;
  }

  @action
  toggleDeviceExpand(): void {
    this.isDeviceExpanded = !this.isDeviceExpanded;
    if (this.isDeviceExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  @action
  handleDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isDeviceExpanded) {
      event.preventDefault();
      this.toggleDeviceExpand();
    }
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

    window.addEventListener('keydown', this.handleDocumentKeyDown);

    this.loadScan.perform(args.scanId);
  }

  willDestroy(): void {
    super.willDestroy();

    this.eventBus.off(
      'ws:offsec-scan:update',
      this,
      this.handleWsOffsecScanUpdate
    );
    window.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.body.style.overflow = '';
    this.stopPolling?.();
    this.teardownDeviceObserver();
  }

  @action
  handleWsOffsecScanUpdate(updatedScan: OffsecScanModel): void {
    if (updatedScan && String(updatedScan.id) === String(this.args.scanId)) {
      this.scan = updatedScan;
      if (updatedScan.isTerminal) {
        this.activeScreenUrl = null;
        this.activeScreenPassword = null;
        this.stopPolling?.();
        this.stopPolling = undefined;
        if (!this.hasLog && !this.scan.logAttempted) {
          this.loadLog.perform();
        }
      } else if (updatedScan.isRunning && !this.activeScreenUrl) {
        this.loadScreenStream.perform();
      }
    }
  }

  get adapter(): OffsecScanAdapter {
    return this.store.adapterFor('offsec-scan');
  }

  get isLoading(): boolean {
    return this.loadScan.isRunning || !this.scan;
  }

  get displayTargetId(): string | number {
    return this.scan?.displayTargetId ?? this.args.scanId;
  }

  get artifacts(): OffsecScanArtifact[] {
    return this.scan?.artifactList ?? [];
  }

  get runSubtitle(): string {
    const scan = this.scan;

    if (scan?.isFailed) {
      return this.intl.t('offensiveSecurity.runSubtitleFailed');
    }

    if (scan?.isCompleted) {
      return this.intl.t('offensiveSecurity.runSubtitleCompleted');
    }

    return this.intl.t(
      scan?.isRunning
        ? 'offensiveSecurity.runSubtitleRunning'
        : 'offensiveSecurity.runSubtitleQueued'
    );
  }

  get canViewResults(): boolean {
    return Boolean(this.scan && (this.scan.isRunning || this.scan.isCompleted));
  }

  get platformLabel(): string {
    return this.intl.t(this.scan?.platform === 'ios' ? 'ios' : 'android');
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

  get deviceFarmURL(): string | null {
    if (this.activeScreenUrl) {
      return this.activeScreenUrl;
    }

    const directUrl =
      this.scan?.screenUrl ||
      this.scan?.vncUrl ||
      this.scan?.screen?.url ||
      this.scan?.screen?.ws_url;

    if (directUrl) {
      return directUrl;
    }

    const token =
      this.scan?.screenToken ||
      this.scan?.vncToken ||
      this.scan?.screen?.token ||
      this.scan?.deviceSerial;

    if (token) {
      try {
        return this.devicefarm.getTokenizedWSURL(token);
      } catch {
        return null;
      }
    }

    return null;
  }

  get deviceFarmPassword(): string | null {
    return this.activeScreenPassword || ENV.deviceFarmPassword || null;
  }

  get hasDeviceStream(): boolean {
    return Boolean(this.deviceFarmURL);
  }

  get isDeviceActive(): boolean {
    return Boolean(this.scan?.isRunning && this.hasDeviceStream);
  }

  get deviceStatus(): 'live' | 'waiting' | 'ended' {
    if (this.scan?.isTerminal) {
      return 'ended';
    }

    return this.isDeviceActive ? 'live' : 'waiting';
  }

  get deviceStatusLabel(): string {
    return this.intl.t(
      {
        live: 'offensiveSecurity.deviceLive',
        waiting: 'offensiveSecurity.deviceConnecting',
        ended: 'offensiveSecurity.deviceStreamEnded',
      }[this.deviceStatus]
    );
  }

  get deviceCaption(): string {
    if (this.scan?.isFailed) {
      return this.intl.t('offensiveSecurity.deviceCaptionFailed');
    }

    return this.intl.t(
      {
        live: 'offensiveSecurity.deviceCaptionLive',
        waiting: 'offensiveSecurity.deviceCaptionWaiting',
        ended: 'offensiveSecurity.deviceCaptionEnded',
      }[this.deviceStatus]
    );
  }

  @action
  viewResults(): void {
    this.router.transitionTo(
      'authenticated.offensive-security.results',
      this.args.scanId
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
          if (this.scan.isRunning && !this.activeScreenUrl) {
            this.loadScreenStream.perform();
          }
        } else if (!this.hasLog && !this.scan.logAttempted) {
          this.loadLog.perform();
        }
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

        this.router.transitionTo('authenticated.offensive-security.index');
      }
    }
  );

  loadScreenStream = task({ drop: true }, async () => {
    if (!this.scan?.isRunning) {
      return;
    }

    try {
      const res = await this.adapter.fetchScreenStream(
        'offsec-scan',
        this.args.scanId
      );

      const url = res?.url || res?.vnc_url;
      const token = res?.token || res?.vnc_token;

      if (url) {
        this.activeScreenUrl = url;
      } else if (token) {
        try {
          this.activeScreenUrl = this.devicefarm.getTokenizedWSURL(token);
        } catch {
          // ignore invalid token error
        }
      }

      if (res?.password) {
        this.activeScreenPassword = res.password;
      }
    } catch {
      // 404/503 when scan has no external ID, is not running, or screen session is not ready yet
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
        if (this.scan) {
          this.scan.cachedLogLines = lines;
        }
      }
      this.logLoadFailed = false;

      if (this.scan) {
        const streamUrl = (res['screen_url'] ??
          res['vnc_url'] ??
          res['ws_url']) as string | undefined;
        if (streamUrl && !this.scan.screenUrl) {
          this.scan.screenUrl = streamUrl;
        }

        const screenToken = (res['screen_token'] ?? res['vnc_token']) as
          | string
          | undefined;
        if (screenToken && !this.scan.screenToken) {
          this.scan.screenToken = screenToken;
        }

        const deviceSerial = (res['device_serial'] ?? res['deviceSerial']) as
          | string
          | undefined;
        if (deviceSerial && !this.scan.deviceSerial) {
          this.scan.deviceSerial = deviceSerial;
        }
      }

      if (this.scan?.isRunning && !this.activeScreenUrl) {
        this.loadScreenStream.perform();
      }

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
        this.activeScreenUrl = null;
        this.activeScreenPassword = null;
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
