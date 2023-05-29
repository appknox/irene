import Component from '@glimmer/component';

import SbomScanModel, { SbomScanStatus } from 'irene/models/sbom-scan';

export interface SbomAppScanListViewReportSignature {
  Args: {
    sbomScan: SbomScanModel;
    onViewReportClick: (sbomScan: SbomScanModel) => void;
  };
}

export default class SbomAppScanListViewReportComponent extends Component<SbomAppScanListViewReportSignature> {
  get disableViewReport() {
    return this.args.sbomScan.status !== SbomScanStatus.COMPLETED;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::ViewReport': typeof SbomAppScanListViewReportComponent;
    'sbom/app-scan/list/view-report': typeof SbomAppScanListViewReportComponent;
  }
}
