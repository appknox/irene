import Component from '@glimmer/component';
import SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListVersionSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListVersionComponent extends Component<SbomScanDetailsComponentListVersionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Version': typeof SbomScanDetailsComponentListVersionComponent;
    'sbom/scan-details/component-list/version': typeof SbomScanDetailsComponentListVersionComponent;
  }
}
