import Component from '@glimmer/component';
import { capitalize } from '@ember/string';

import SbomScanComponentModel from 'irene/models/sbom-scan-component';

export interface SbomScanDetailsComponentListTypeSignature {
  Args: {
    sbomScanComponent: SbomScanComponentModel;
  };
}

export default class SbomScanDetailsComponentListTypeComponent extends Component<SbomScanDetailsComponentListTypeSignature> {
  get type() {
    return capitalize(this.args.sbomScanComponent.type);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Type': typeof SbomScanDetailsComponentListTypeComponent;
    'sbom/scan-details/component-list/type': typeof SbomScanDetailsComponentListTypeComponent;
  }
}
