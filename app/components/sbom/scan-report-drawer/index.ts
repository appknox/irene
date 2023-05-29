import Component from '@glimmer/component';

import SbomFileModel from 'irene/models/sbom-file';

export interface SbomScanReportDrawerSignature {
  Args: {
    sbomFile: SbomFileModel | null;
    showAppDetails?: boolean;
    open?: boolean;
    onClose: () => void;
  };
}

export default class SbomScanReportDrawerComponent extends Component<SbomScanReportDrawerSignature> {
  get sbomProject() {
    return this.args.sbomFile?.sbProject.content;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer': typeof SbomScanReportDrawerComponent;
  }
}
