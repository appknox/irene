import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type LoggerService from 'irene/services/logger';

interface KnoxIqScanSummarySignature {
  Element: HTMLDivElement;
  Args: {
    file: FileModel;
    hasAnyKnoxiqScanCompleted?: boolean;
  };
}

export default class KnoxIqScanSummaryComponent extends Component<KnoxIqScanSummarySignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare logger: LoggerService;

  @tracked previousFile: FileModel | null = null;

  constructor(owner: unknown, args: KnoxIqScanSummarySignature['Args']) {
    super(owner, args);

    this.fetchPreviousFile.perform();
  }

  get scanSummaryAccentClass() {
    return this.args.hasAnyKnoxiqScanCompleted
      ? 'scan-summary-accent-done'
      : 'scan-summary-accent-pending';
  }

  get compareRouteModel() {
    if (this.previousFile && this.args.file.isLegacyKnoxIQScan) {
      return `${this.args.file.id}...${this.previousFile.id}`;
    }

    return null;
  }

  fetchPreviousFile = task(async () => {
    try {
      this.previousFile = await waitForPromise(
        this.args.file.fetchPreviousFile()
      );
    } catch (error) {
      this.logger.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::ScanSummary': typeof KnoxIqScanSummaryComponent;
  }
}
