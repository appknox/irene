import Component from '@glimmer/component';
import { capitalize } from '@ember/string';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListTypeSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListTypeComponent extends Component<SbomScanDetailsComponentListTypeSignature> {
  @service declare intl: IntlService;

  get type() {
    if (this.args.sbomComponent?.isMLModel) {
      return this.intl.t('sbomModule.mlModel');
    }

    return capitalize(this.args.sbomComponent?.type) || '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Type': typeof SbomScanDetailsComponentListTypeComponent;
    'sbom/scan-details/component-list/type': typeof SbomScanDetailsComponentListTypeComponent;
  }
}
