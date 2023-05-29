import Component from '@glimmer/component';

import SbomScanModel from 'irene/models/sbom-scan';

export interface SbomScanReportDrawerSignature {
  Args: {
    sbomScan: SbomScanModel | null;
    showAppDetails?: boolean;
    open?: boolean;
    onClose: () => void;
  };
}

export default class SbomScanReportDrawerComponent extends Component<SbomScanReportDrawerSignature> {
  get sbomApp() {
    return this.args.sbomScan?.sbProject.content;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer': typeof SbomScanReportDrawerComponent;
  }
}
