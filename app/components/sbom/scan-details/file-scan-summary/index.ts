import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import dayjs from 'dayjs';

import SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import SbomFileModel, { SbomScanStatus } from 'irene/models/sbom-file';

export interface SbomScanDetailsFileScanSummarySignature {
  Args: {
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
  };
}

interface FileScanSummaryItem {
  label: string;
  value?: string;
  component?: 'sbom/scan-status' | null;
  link?: boolean;
  linkArgs?: {
    route: string;
    model: string;
  };
  hideDivider?: boolean;
}

export default class SbomScanDetailsFileScanSummaryComponent extends Component<SbomScanDetailsFileScanSummarySignature> {
  @service declare intl: IntlService;

  get scanStatusCompleted() {
    return this.args.sbomFile.status === SbomScanStatus.COMPLETED;
  }

  get fileSummary() {
    return [
      this.scanStatusCompleted && {
        label: this.intl.t('status'),
        component: 'sbom/scan-status' as const,
      },
      this.scanStatusCompleted && {
        label: this.intl.t('sbomModule.generatedDate'),
        value: dayjs(this.args.sbomFile.completedAt).format('MMM DD, YYYY'),
      },
      {
        label: this.intl.t('version'),
        value: this.args.sbomFile.file.get('version'),
      },
      {
        label: this.intl.t('sbomModule.versionCode'),
        value: this.args.sbomFile.file.get('versionCode'),
      },
      {
        label: this.intl.t('file'),
        value: this.args.sbomFile.file.get('id'),
        link: true,
        linkArgs: {
          route: 'authenticated.dashboard.file',
          model: this.args.sbomFile.file.get('id'),
        },
        hideDivider: true,
      },
    ].filter(Boolean) as FileScanSummaryItem[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::FileScanSummary': typeof SbomScanDetailsFileScanSummaryComponent;
  }
}
