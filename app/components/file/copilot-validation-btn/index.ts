import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type FileAdapter from 'irene/adapters/file';
import type { CopilotScanStatus } from 'irene/adapters/file';
import type PollService from 'irene/services/poll';
import parseError from 'irene/utils/parse-error';

const POLL_INTERVAL_MS = 5000;
const IN_PROGRESS_STATUSES = new Set(['pending', 'running']);

export interface FileCopilotValidationBtnSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileCopilotValidationBtn extends Component<FileCopilotValidationBtnSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare poll: PollService;

  @tracked copilotStatuses: CopilotScanStatus[] = [];

  private stopStatusPoll?: () => void;

  constructor(owner: unknown, args: FileCopilotValidationBtnSignature['Args']) {
    super(owner, args);
    // Fetch immediately so the button state is correct before the first poll fires
    this.fetchStatus.perform();
    this.startStatusPolling();
  }

  willDestroy() {
    super.willDestroy();
    this.stopStatusPoll?.();
  }

  get isValidationInProgress() {
    return this.copilotStatuses.some((s) => IN_PROGRESS_STATUSES.has(s.status));
  }

  get isTriggerDisabled() {
    return (
      this.triggerValidation.isRunning ||
      this.fetchStatus.isRunning ||
      this.isValidationInProgress
    );
  }

  fetchStatus = task(async () => {
    try {
      const adapter = this.store.adapterFor('file') as FileAdapter;
      const resp = await adapter.fetchCopilotStatus(String(this.args.file.id));
      this.copilotStatuses = resp.scan_statuses ?? [];
    } catch {
      // non-fatal — poll will retry
    }
  });

  startStatusPolling() {
    this.stopStatusPoll?.();

    this.stopStatusPoll = this.poll.startPolling(async () => {
      await this.fetchStatus.perform();
    }, POLL_INTERVAL_MS);
  }

  triggerValidation = task(async () => {
    try {
      const adapter = this.store.adapterFor('file') as FileAdapter;

      await adapter.triggerCopilotValidation(String(this.args.file.id));

      this.notify.success('Copilot validation triggered successfully');
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::CopilotValidationBtn': typeof FileCopilotValidationBtn;
  }
}
