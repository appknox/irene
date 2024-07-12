import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';

export interface FileDetailsManualScanProgressStatusSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsManualScanProgressStatusComponent extends Component<FileDetailsManualScanProgressStatusSignature> {
  @service declare intl: IntlService;

  get manualScanStatusText() {
    if (this.args.file.isManualDone) {
      return {
        title: this.intl.t('manualScan'),
        hasChip: true,
        chipLabel: this.intl.t('chipStatus.completed'),
        chipColor: 'success' as const,
      };
    } else if (
      this.args.file.manual == ENUMS.MANUAL.ASSESSING &&
      !this.args.file.isManualDone
    ) {
      return {
        title: this.intl.t('scanInProgress'),
        description: this.intl.t('modalCard.manual.scanInProgressDescription'),
      };
    } else {
      return {
        title: this.intl.t('requested'),
        description: this.intl.t(
          'modalCard.manual.requestSubmittedDescription'
        ),
      };
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::ProgressStatus': typeof FileDetailsManualScanProgressStatusComponent;
    'file-details/manual-scan/progress-status': typeof FileDetailsManualScanProgressStatusComponent;
  }
}
