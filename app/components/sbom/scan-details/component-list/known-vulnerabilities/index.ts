import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListKnownVulnerabilitiesSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListKnownVulnerabilitiesComponent extends Component<SbomScanDetailsComponentListKnownVulnerabilitiesSignature> {
  @service declare intl: IntlService;

  get hasVulnerabilitiesLabel() {
    return this.intl
      .t(this.args.sbomComponent.isVulnerable ? 'yes' : 'no')
      .toUpperCase();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::KnownVulnerabilities': typeof SbomScanDetailsComponentListKnownVulnerabilitiesComponent;
    'sbom/scan-details/component-list/known-vulnerabilities': typeof SbomScanDetailsComponentListKnownVulnerabilitiesComponent;
  }
}
