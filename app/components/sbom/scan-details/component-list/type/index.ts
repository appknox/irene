import Component from '@glimmer/component';
import { capitalize } from '@ember/string';

import SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListTypeSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListTypeComponent extends Component<SbomScanDetailsComponentListTypeSignature> {
  get type() {
    return capitalize(this.args.sbomComponent.type);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Type': typeof SbomScanDetailsComponentListTypeComponent;
    'sbom/scan-details/component-list/type': typeof SbomScanDetailsComponentListTypeComponent;
  }
}
