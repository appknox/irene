import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type FileAdapter from 'irene/adapters/file';
import {
  KNOXIQ_SCAN_STATUS,
  type KnoxIQFileStatusResponse,
} from 'irene/adapters/file';
import type PollService from 'irene/services/poll';
import parseError from 'irene/utils/parse-error';

const POLL_INTERVAL_MS = 5000;

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

  @tracked knoxiqStatuses: KnoxIQFileStatusResponse = {};

  private stopStatusPoll?: () => void;

  constructor(owner: unknown, args: FileCopilotValidationBtnSignature['Args']) {
    super(owner, args);
    this.fetchStatus.perform();
    this.startStatusPolling();
  }

  willDestroy() {
    super.willDestroy();
    this.stopStatusPoll?.();
  }

  get isTriggerDisabled() {
    return (
      this.triggerValidation.isRunning ||
      this.fetchStatus.isRunning ||
      Object.values(this.knoxiqStatuses).some(
        (s) =>
          s.status === KNOXIQ_SCAN_STATUS.PENDING ||
          s.status === KNOXIQ_SCAN_STATUS.RUNNING
      )
    );
  }

  fetchStatus = task(async () => {
    try {
      const adapter = this.store.adapterFor('file') as FileAdapter;
      this.knoxiqStatuses = await adapter.fetchKnoxIQStatus(
        String(this.args.file.id)
      );

      const hasActive = Object.values(this.knoxiqStatuses).some(
        (s) =>
          s.status === KNOXIQ_SCAN_STATUS.PENDING ||
          s.status === KNOXIQ_SCAN_STATUS.RUNNING
      );

      if (!hasActive) {
        this.stopStatusPoll?.();
      }
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
      await adapter.triggerKnoxIQScan(String(this.args.file.id));
      this.notify.success('KnoxIQ scan triggered successfully');
      this.startStatusPolling();
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
