import Component from '@glimmer/component';
import { capitalize } from '@ember/string';

import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomComponentInventoryDetailsDrawerDependencyTypeSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomComponentInventoryDetailsDrawerDependencyTypeComponent extends Component<SbomComponentInventoryDetailsDrawerDependencyTypeSignature> {
  get dependencyType() {
    const value = this.args.sbomProject.dependencyType;

    return value ? capitalize(value) : '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::DetailsDrawer::DependencyType': typeof SbomComponentInventoryDetailsDrawerDependencyTypeComponent;
    'sbom/component-inventory/details-drawer/dependency-type': typeof SbomComponentInventoryDetailsDrawerDependencyTypeComponent;
  }
}
