import Component from '@glimmer/component';

import SbomProjectModel from 'irene/models/sbom-project';
import { SbomAppScanQueryParam } from 'irene/routes/authenticated/dashboard/sbom/app-scans';

export interface SbomAppScanSignature {
  Args: {
    sbomProject: SbomProjectModel;
    queryParams: SbomAppScanQueryParam;
  };
}

export default class SbomAppScanComponent extends Component<SbomAppScanSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan': typeof SbomAppScanComponent;
  }
}
