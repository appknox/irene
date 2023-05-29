import Component from '@glimmer/component';
import SbomScanComponentModel from 'irene/models/sbom-scan-component';

export interface SbomScanDetailsComponentListVersionSignature {
  Args: {
    sbomScanComponent: SbomScanComponentModel;
  };
}

export default class SbomScanDetailsComponentListVersionComponent extends Component<SbomScanDetailsComponentListVersionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Version': typeof SbomScanDetailsComponentListVersionComponent;
    'sbom/scan-details/component-list/version': typeof SbomScanDetailsComponentListVersionComponent;
  }
}
