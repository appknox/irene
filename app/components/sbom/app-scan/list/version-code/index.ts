import Component from '@glimmer/component';

import SbomFileModel from 'irene/models/sbom-file';

export interface SbomAppScanListVersionCodeSignature {
  Args: {
    sbomFile: SbomFileModel;
  };
}

export default class SbomAppScanListVersionCodeComponent extends Component<SbomAppScanListVersionCodeSignature> {
  get versionCode() {
    return this.args.sbomFile.file.get('versionCode');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::VersionCode': typeof SbomAppScanListVersionCodeComponent;
    'sbom/app-scan/list/version-code': typeof SbomAppScanListVersionCodeComponent;
  }
}
