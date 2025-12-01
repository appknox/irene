import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';

import FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';

export interface FileDetailsScanActionsManualScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
  };
}

export default class FileDetailsScanActionsManualScanComponent extends Component<FileDetailsScanActionsManualScanSignature> {
  @service declare intl: IntlService;

  get manualScanStatusLabels() {
    return {
      [ENUMS.MANUAL.NONE]: this.intl.t('notStarted'),
      [ENUMS.MANUAL.REQUESTED]: this.intl.t('requested'),
      [ENUMS.MANUAL.ASSESSING]: this.intl.t('inProgress'),
      [ENUMS.MANUAL.DONE]: this.intl.t('completed'),
    };
  }

  get manualScanStatusText() {
    if (this.args.file.isManualDone) {
      return this.manualScanStatusLabels[ENUMS.MANUAL.DONE];
    } else if (this.args.file.manual == 3 && !this.args.file.isManualDone) {
      return this.manualScanStatusLabels[ENUMS.MANUAL.ASSESSING];
    } else {
      return this.manualScanStatusLabels[this.args.file.manual];
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ManualScan': typeof FileDetailsScanActionsManualScanComponent;
    'file-details/scan-actions/manual-scan': typeof FileDetailsScanActionsManualScanComponent;
  }
}
