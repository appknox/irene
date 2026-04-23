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
import type { CopilotScanStatus } from 'irene/adapters/file';

const POLL_INTERVAL_MS = 5000;
const TERMINAL_STATUSES = new Set(['completed', 'failed']);
const STATUS_PRIORITY: Record<string, number> = {
  running: 3,
  pending: 2,
  failed: 1,
  completed: 0,
};

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
  @tracked copilotStatuses: CopilotScanStatus[] = [];

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

  get copilotStatusByScanType(): Record<string, CopilotScanStatus | undefined> {
    const map: Record<string, CopilotScanStatus> = {};

    for (const s of this.copilotStatuses) {
      const existing = map[s.scan_type];
      const priority = STATUS_PRIORITY[s.status] ?? -1;
      const existingPriority = existing
        ? (STATUS_PRIORITY[existing.status] ?? -1)
        : -1;

      if (!existing || priority > existingPriority) {
        map[s.scan_type] = s;
      }
    }

    return map;
  }

  get dynamicCopilotStatus(): CopilotScanStatus | undefined {
    const candidates = ['dast_manual', 'dast_automated', 'dynamic']
      .map((t) => this.copilotStatusByScanType[t])
      .filter(Boolean) as CopilotScanStatus[];

    if (!candidates.length) return undefined;

    return candidates.reduce((best, current) => {
      const bestPriority = STATUS_PRIORITY[best.status] ?? -1;
      const currentPriority = STATUS_PRIORITY[current.status] ?? -1;
      return currentPriority > bestPriority ? current : best;
    });
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
      const resp = await adapter.fetchCopilotStatus(String(this.args.file.id));

      this.copilotStatuses = resp.scan_statuses ?? [];

      const allTerminal =
        this.copilotStatuses.length > 0 &&
        this.copilotStatuses.every((s) => TERMINAL_STATUSES.has(s.status));

      if (allTerminal) {
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
