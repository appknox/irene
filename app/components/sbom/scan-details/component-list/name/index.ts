import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListNameSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListNameComponent extends Component<SbomScanDetailsComponentListNameSignature> {
  @service declare intl: IntlService;

  get name() {
    return this.args.sbomComponent?.name ?? '-';
  }

  get isStaleVulnData() {
    return Boolean(this.args.sbomComponent?.isStaleVulnData);
  }

  get isStaleVersionData() {
    return Boolean(this.args.sbomComponent?.isStaleVersionData);
  }

  get vulnTooltip() {
    return this.intl.t('sbomModule.staleVulnDataTooltip');
  }

  get versionTooltip() {
    return this.intl.t('sbomModule.staleVersionDataTooltip');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Name': typeof SbomScanDetailsComponentListNameComponent;
    'sbom/scan-details/component-list/name': typeof SbomScanDetailsComponentListNameComponent;
  }
}
