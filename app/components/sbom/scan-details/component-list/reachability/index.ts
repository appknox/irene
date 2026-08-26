import Component from '@glimmer/component';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListReachabilitySignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListReachabilityComponent extends Component<SbomScanDetailsComponentListReachabilitySignature> {
  get verdict() {
    return this.args.sbomComponent.reachability?.verdict ?? null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Reachability': typeof SbomScanDetailsComponentListReachabilityComponent;
    'sbom/scan-details/component-list/reachability': typeof SbomScanDetailsComponentListReachabilityComponent;
  }
}
