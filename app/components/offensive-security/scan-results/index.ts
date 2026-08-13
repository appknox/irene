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
import type PollService from 'irene/services/poll';

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

  @tracked scan: OffsecScanModel | null = null;
  @tracked logLines: string[] = [];
  @tracked logLoadFailed = false;

  stopPolling?: () => void;

  constructor(
    owner: unknown,
    args: OffensiveSecurityScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.loadScan.perform(args.scanId);
  }

  willDestroy(): void {
    super.willDestroy();

    this.stopPolling?.();
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

      this.window.open(url, '_blank');
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

      // The persisted log only exists once the run is over — there is no live
      // stream in this version.
      if (this.scan.isTerminal && !this.hasLog) {
        this.loadLog.perform();
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      this.router.transitionTo(
        'authenticated.dashboard.offensive-security.index'
      );
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
      // In development the backend log endpoint may not be wired yet, so fall
      // back to a sample transcript to keep the run view populated. Staging and
      // production show the real empty/failed state instead — never fake logs.
      if (ENV.environment === 'development') {
        this.logLines = [...OFFSEC_SAMPLE_LOG_LINES];
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
      () => this.loadScan.perform(this.args.scanId),
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
