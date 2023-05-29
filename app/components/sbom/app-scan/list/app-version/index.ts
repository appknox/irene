import Component from '@glimmer/component';

import SbomScanModel from 'irene/models/sbom-scan';

export interface SbomAppScanListAppVersionSignature {
  Args: {
    sbomScan: SbomScanModel;
  };
}

export default class SbomAppScanListAppVersionComponent extends Component<SbomAppScanListAppVersionSignature> {
  get version() {
    return this.args.sbomScan.file.get('version');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::AppVersion': typeof SbomAppScanListAppVersionComponent;
    'sbom/app-scan/list/app-version': typeof SbomAppScanListAppVersionComponent;
  }
}
