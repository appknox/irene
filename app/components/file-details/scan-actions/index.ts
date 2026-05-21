import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';

import type Store from 'ember-data/store';
import type FileModel from 'irene/models/file';
import type OrganizationService from 'irene/services/organization';
import type FileRiskModel from 'irene/models/file-risk';
import type PollService from 'irene/services/poll';
import type FileAdapter from 'irene/adapters/file';
import {
  KNOXIQ_SCAN_STATUS,
  KNOXIQ_SCAN_TYPE,
  type KnoxIQScanStatusEntry,
  type KnoxIQFileStatusResponse,
} from 'irene/adapters/file';

const POLL_INTERVAL_MS = 5000;

const VISIBLE_STATUSES = new Set<number>([
  KNOXIQ_SCAN_STATUS.PENDING,
  KNOXIQ_SCAN_STATUS.RUNNING,
  KNOXIQ_SCAN_STATUS.COMPLETED,
  KNOXIQ_SCAN_STATUS.ERRORED,
]);

export interface FileDetailsScanActionsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsComponent extends Component<FileDetailsScanActionsSignature> {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare poll: PollService;

  @tracked fileRisk: FileRiskModel | null = null;
  @tracked knoxiqStatusResponse: KnoxIQFileStatusResponse = {};

  private stopCopilotPoll?: () => void;

  constructor(owner: unknown, args: FileDetailsScanActionsSignature['Args']) {
    super(owner, args);

    this.fetchFileRisk.perform();
    this.fetchCopilotStatus.perform();
    this.startCopilotPolling();
  }

  willDestroy() {
    super.willDestroy();
    this.stopCopilotPoll?.();
  }

  get isManualScanDisabled() {
    return !this.args.file.project.get('isManualScanAvailable');
  }

  get isAPIScanEnabled() {
    return this.args.file.project.get('isAPIScanEnabled');
  }

  get riskCountByScanType() {
    return (
      this.fileRisk?.get('riskCountByScanType') || {
        static: null,
        dynamic: null,
        api: null,
        manual: null,
      }
    );
  }

  private _visibleEntry(
    entry: KnoxIQScanStatusEntry | undefined
  ): KnoxIQScanStatusEntry | undefined {
    return entry && VISIBLE_STATUSES.has(entry.status) ? entry : undefined;
  }

  get copilotStatusByScanType(): Record<
    string,
    KnoxIQScanStatusEntry | undefined
  > {
    return {
      sast: this._visibleEntry(this.knoxiqStatusResponse[KNOXIQ_SCAN_TYPE.SAST]),
      api: this._visibleEntry(this.knoxiqStatusResponse[KNOXIQ_SCAN_TYPE.API]),
    };
  }

  get dynamicCopilotStatus(): KnoxIQScanStatusEntry | undefined {
    return this._visibleEntry(
      this.knoxiqStatusResponse[KNOXIQ_SCAN_TYPE.DAST]
    );
  }

  startCopilotPolling() {
    this.stopCopilotPoll?.();

    this.stopCopilotPoll = this.poll.startPolling(async () => {
      await this.fetchCopilotStatus.perform();
    }, POLL_INTERVAL_MS);
  }

  fetchCopilotStatus = task(async () => {
    try {
      const adapter = this.store.adapterFor('file') as FileAdapter;
      this.knoxiqStatusResponse = await adapter.fetchKnoxIQStatus(
        String(this.args.file.id)
      );

      const hasActive = Object.values(this.knoxiqStatusResponse).some(
        (s) =>
          s.status === KNOXIQ_SCAN_STATUS.PENDING ||
          s.status === KNOXIQ_SCAN_STATUS.RUNNING
      );

      if (!hasActive) {
        this.stopCopilotPoll?.();
      }
    } catch {
      // keep polling on transient errors
    }
  });

  fetchFileRisk = task(async () => {
    this.fileRisk = await this.args.file.fetchFileRisk();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions': typeof FileDetailsScanActionsComponent;
  }
}
