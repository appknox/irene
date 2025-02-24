import Component from '@glimmer/component';

import SbomFileModel from 'irene/models/sbom-file';

export interface SbomScanStatusSignature {
  Args: {
    sbomFile: SbomFileModel;
  };
}

export default class SbomScanStatusComponent extends Component<SbomScanStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanStatus': typeof SbomScanStatusComponent;
    'sbom/scan-status': typeof SbomScanStatusComponent;
  }
}
