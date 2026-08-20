import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type FileAdapter from 'irene/adapters/file';
import type { KnoxiqScanStatusByType } from 'irene/components/file-details';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsScanActionsStaticScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    isKnoxiqEnabled?: boolean;
    knoxiqStatuses?: KnoxiqScanStatusByType;
  };
}

export default class FileDetailsScanActionsStaticScanComponent extends Component<FileDetailsScanActionsStaticScanSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get sastStatus() {
    return this.args.knoxiqStatuses?.[ENUMS.KNOXIQ_SCAN_TYPE.SAST];
  }

  get showKnoxiqStatusChip() {
    return Boolean(
      this.args.isKnoxiqEnabled && this.args.file.isKnoxiqAutomated
    );
  }

  get knoxiqStatusChipState() {
    const { COMPLETED, ERRORED } = ENUMS.KNOXIQ_SCAN_STATUS;

    if (this.sastStatus === COMPLETED) {
      return 'completed';
    }

    if (this.sastStatus === ERRORED) {
      return 'failed';
    }

    return 'running';
  }

  get staticScanAccentClass() {
    if (
      !this.args.isKnoxiqEnabled ||
      !this.args.file.isStaticDone ||
      this.args.file.isKnoxiqAutomated
    ) {
      return '';
    }

    return this.sastStatus === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED
      ? 'static-scan-accent-done'
      : 'static-scan-accent-pending';
  }

  initiateStaticScanTask = task(async () => {
    try {
      const adapter = this.store.adapterFor('file') as FileAdapter;
      await adapter.startStaticScan(this.args.file.id);
      this.args.file.isStaticScanStarted = true;
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  @action
  handleInitiateStaticScan() {
    this.initiateStaticScanTask.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::StaticScan': typeof FileDetailsScanActionsStaticScanComponent;
    'file-details/scan-actions/static-scan': typeof FileDetailsScanActionsStaticScanComponent;
  }
}
