import Component from '@glimmer/component';
import SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListDependencyTypeSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListDependencyTypeComponent extends Component<SbomScanDetailsComponentListDependencyTypeSignature> {
  get dependencyType() {
    if (this.args.sbomComponent.isDependency) {
      return 'Transitive';
    }

    return 'Direct';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::DependencyType': typeof SbomScanDetailsComponentListDependencyTypeComponent;
    'sbom/scan-details/component-list/dependency-type': typeof SbomScanDetailsComponentListDependencyTypeComponent;
  }
}
