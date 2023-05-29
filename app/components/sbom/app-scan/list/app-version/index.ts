import Component from '@glimmer/component';

import SbomFileModel from 'irene/models/sbom-file';

export interface SbomAppScanListAppVersionSignature {
  Args: {
    sbomFile: SbomFileModel;
  };
}

export default class SbomAppScanListAppVersionComponent extends Component<SbomAppScanListAppVersionSignature> {
  get version() {
    return this.args.sbomFile.file.get('version');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::AppVersion': typeof SbomAppScanListAppVersionComponent;
    'sbom/app-scan/list/app-version': typeof SbomAppScanListAppVersionComponent;
  }
}
