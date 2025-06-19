import Component from '@glimmer/component';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import type ScanCoverageModel from 'irene/models/scan-coverage';

export interface FileDetailsDynamicScanResultsHeaderSignature {
  Args: {
    file: FileModel;
    scanCoverage: ScanCoverageModel | null;
  };
  Blocks: {
    default: [];
  };
}

export default class FileDetailsDynamicScanResultsHeader extends Component<FileDetailsDynamicScanResultsHeaderSignature> {
  @service declare intl: IntlService;

  get file() {
    return this.args.file;
  }

  get showCoverageBadge() {
    return this.args.scanCoverage?.isAnyScreenCoverageComplete;
  }

  get tabItems() {
    return [
      {
        id: 'vulnerability-details',
        label: this.intl.t('vulnerabilityDetails'),
        route: 'authenticated.dashboard.file.dynamic-scan.results.index',
        hasBadge: false,
        models: [this.file.id],
      },
      {
        id: 'scan-coverage',
        label: this.intl.t('scanCoverage.title'),
        hasBadge: this.showCoverageBadge,
        badgeCount: this.args.scanCoverage?.coverage,
        models: [this.file.id],
        route:
          'authenticated.dashboard.file.dynamic-scan.results.scan-coverage',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::Header': typeof FileDetailsDynamicScanResultsHeader;
  }
}
