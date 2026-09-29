import Component from '@glimmer/component';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListNameSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListNameComponent extends Component<SbomScanDetailsComponentListNameSignature> {
  get name() {
    return this.args.sbomComponent?.name ?? '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Name': typeof SbomScanDetailsComponentListNameComponent;
    'sbom/scan-details/component-list/name': typeof SbomScanDetailsComponentListNameComponent;
  }
}
