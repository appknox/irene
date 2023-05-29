import Component from '@glimmer/component';

import SbomAppModel from 'irene/models/sbom-app';
import { SbomAppScanQueryParam } from 'irene/routes/authenticated/dashboard/sbom/app-scans';

export interface SbomAppScanSignature {
  Args: {
    sbomApp: SbomAppModel;
    queryParams: SbomAppScanQueryParam;
  };
}

export default class SbomAppScanComponent extends Component<SbomAppScanSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan': typeof SbomAppScanComponent;
  }
}
