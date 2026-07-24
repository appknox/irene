import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomComponentInventoryDetailsDrawerNamespaceSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomComponentInventoryDetailsDrawerNamespaceComponent extends Component<SbomComponentInventoryDetailsDrawerNamespaceSignature> {
  get packageName() {
    return this.args.sbomProject.project.get('packageName');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::DetailsDrawer::Namespace': typeof SbomComponentInventoryDetailsDrawerNamespaceComponent;
    'sbom/component-inventory/details-drawer/namespace': typeof SbomComponentInventoryDetailsDrawerNamespaceComponent;
  }
}
