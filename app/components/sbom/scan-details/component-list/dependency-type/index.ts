import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListDependencyTypeSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListDependencyTypeComponent extends Component<SbomScanDetailsComponentListDependencyTypeSignature> {
  @service declare intl: IntlService;

  get dependencyType() {
    if (this.args.sbomComponent.isDependency) {
      return this.intl.t('dependencyTypes.transitive');
    }

    return this.intl.t('dependencyTypes.direct');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::DependencyType': typeof SbomScanDetailsComponentListDependencyTypeComponent;
    'sbom/scan-details/component-list/dependency-type': typeof SbomScanDetailsComponentListDependencyTypeComponent;
  }
}
