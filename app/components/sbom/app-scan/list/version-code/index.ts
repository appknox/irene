import Component from '@glimmer/component';

import SbomScanModel from 'irene/models/sbom-scan';

export interface SbomAppScanListVersionCodeSignature {
  Args: {
    sbomScan: SbomScanModel;
  };
}

export default class SbomAppScanListVersionCodeComponent extends Component<SbomAppScanListVersionCodeSignature> {
  get versionCode() {
    return this.args.sbomScan.file.get('versionCode');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::VersionCode': typeof SbomAppScanListVersionCodeComponent;
    'sbom/app-scan/list/version-code': typeof SbomAppScanListVersionCodeComponent;
  }
}
