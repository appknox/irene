import Component from '@glimmer/component';

import SbomFileModel, { SbomScanStatus } from 'irene/models/sbom-file';

export interface SbomAppScanListViewReportSignature {
  Args: {
    sbomFile: SbomFileModel;
    onViewReportClick: (sbomFile: SbomFileModel) => void;
  };
}

export default class SbomAppScanListViewReportComponent extends Component<SbomAppScanListViewReportSignature> {
  get disableViewReport() {
    return this.args.sbomFile.status !== SbomScanStatus.COMPLETED;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::ViewReport': typeof SbomAppScanListViewReportComponent;
    'sbom/app-scan/list/view-report': typeof SbomAppScanListViewReportComponent;
  }
}
