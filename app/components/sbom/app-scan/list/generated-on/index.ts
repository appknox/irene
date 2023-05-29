import Component from '@glimmer/component';
import dayjs from 'dayjs';

import SbomFileModel from 'irene/models/sbom-file';

export interface SbomAppScanListGeneratedOnSignature {
  Args: {
    sbomFile: SbomFileModel;
  };
}

export default class SbomAppScanListGeneratedOnComponent extends Component<SbomAppScanListGeneratedOnSignature> {
  get generatedOn() {
    const completedAt = this.args.sbomFile.completedAt;

    return completedAt ? dayjs(completedAt).format('DD MMM YYYY') : '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::GeneratedOn': typeof SbomAppScanListGeneratedOnComponent;
    'sbom/app-scan/list/generated-on': typeof SbomAppScanListGeneratedOnComponent;
  }
}
