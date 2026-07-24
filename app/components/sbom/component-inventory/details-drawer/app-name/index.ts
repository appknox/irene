import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomComponentInventoryDetailsDrawerAppNameSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomComponentInventoryDetailsDrawerAppNameComponent extends Component<SbomComponentInventoryDetailsDrawerAppNameSignature> {
  get name() {
    return this.args.sbomProject.project.get('lastFile')?.get('name');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::DetailsDrawer::AppName': typeof SbomComponentInventoryDetailsDrawerAppNameComponent;
    'sbom/component-inventory/details-drawer/app-name': typeof SbomComponentInventoryDetailsDrawerAppNameComponent;
  }
}
