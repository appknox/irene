import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';

export interface FileDetailsScanActionsDynamicScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsDynamicScanComponent extends Component<FileDetailsScanActionsDynamicScanSignature> {
  @service declare intl: IntlService;

  get chipStatusText() {
    if (this.args.file.isDynamicStatusNeitherNoneNorReadyNorError) {
      return this.args.file.statusText;
    } else if (this.args.file.isDynamicStatusInProgress) {
      return this.intl.t('inProgress');
    } else if (this.args.file.isDynamicDone) {
      return this.intl.t('completed');
    } else {
      return this.intl.t('notStarted');
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::DynamicScan': typeof FileDetailsScanActionsDynamicScanComponent;
    'file-details/scan-actions/dynamic-scan': typeof FileDetailsScanActionsDynamicScanComponent;
  }
}
