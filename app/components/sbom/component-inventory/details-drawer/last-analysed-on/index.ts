import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type SbomProjectModel from 'irene/models/sbom-project';

export interface SbomComponentInventoryDetailsDrawerLastAnalysedOnSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomComponentInventoryDetailsDrawerLastAnalysedOnComponent extends Component<SbomComponentInventoryDetailsDrawerLastAnalysedOnSignature> {
  get lastAnalysedOn() {
    const value = this.args.sbomProject.lastScaAnalysisOn;

    return value ? dayjs(value).format('DD MMM YYYY') : '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::DetailsDrawer::LastAnalysedOn': typeof SbomComponentInventoryDetailsDrawerLastAnalysedOnComponent;
    'sbom/component-inventory/details-drawer/last-analysed-on': typeof SbomComponentInventoryDetailsDrawerLastAnalysedOnComponent;
  }
}
