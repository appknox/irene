import Component from '@glimmer/component';
import dayjs from 'dayjs';

import SbomScanModel from 'irene/models/sbom-scan';

export interface SbomAppScanListGeneratedOnSignature {
  Args: {
    sbomScan: SbomScanModel;
  };
}

export default class SbomAppScanListGeneratedOnComponent extends Component<SbomAppScanListGeneratedOnSignature> {
  get generatedOn() {
    const completedAt = this.args.sbomScan.completedAt;

    return completedAt ? dayjs(completedAt).format('DD MMM YYYY') : '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::GeneratedOn': typeof SbomAppScanListGeneratedOnComponent;
    'sbom/app-scan/list/generated-on': typeof SbomAppScanListGeneratedOnComponent;
  }
}
