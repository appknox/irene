import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type ScanCoverageModel from 'irene/models/scan-coverage';
import type FileModel from 'irene/models/file';

export interface FileDetailsDynamicScanResultsScanCoverageStatusSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    scanCoverage: ScanCoverageModel | null;
    isOldFileWithNoCoverage: boolean;
  };
}

export default class FileDetailsDynamicScanResultsScanCoverageStatus extends Component<FileDetailsDynamicScanResultsScanCoverageStatusSignature> {
  @service declare intl: IntlService;

  get scanCoverage() {
    return this.args.scanCoverage;
  }

  get coverageIsUnsupported() {
    return (
      !this.args.file.screenCoverageSupported ||
      this.args.isOldFileWithNoCoverage
    );
  }

  get coverageIsNotStarted() {
    return this.scanCoverage === null || this.scanCoverage.coverageIsNotStarted;
  }

  get coverageIsError() {
    return this.scanCoverage?.coverageIsErrored;
  }

  get statusTitle() {
    if (this.coverageIsUnsupported) {
      return this.intl.t('scanCoverage.unsupported.title');
    }

    if (this.coverageIsNotStarted) {
      return this.intl.t('scanCoverage.notStartedMsg');
    }

    if (this.scanCoverage?.coverageIsInProgress) {
      return this.intl.t('scanCoverage.inProgressMsg');
    }

    return this.intl.t('scanCoverage.errorMsg');
  }

  get statusSubtext() {
    return this.coverageIsUnsupported
      ? this.intl.t('scanCoverage.unsupported.description')
      : '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ScanCoverage::Status': typeof FileDetailsDynamicScanResultsScanCoverageStatus;
  }
}
