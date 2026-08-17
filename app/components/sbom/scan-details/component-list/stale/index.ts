import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListStaleSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomScanDetailsComponentListStaleComponent extends Component<SbomScanDetailsComponentListStaleSignature> {
  @service declare intl: IntlService;

  get isStaleVulnData() {
    return Boolean(this.args.sbomComponent?.isStaleVulnData);
  }

  get isStaleVersionData() {
    return Boolean(this.args.sbomComponent?.isStaleVersionData);
  }

  get isStale() {
    return this.isStaleVulnData || this.isStaleVersionData;
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
    'Sbom::ScanDetails::ComponentList::Stale': typeof SbomScanDetailsComponentListStaleComponent;
    'sbom/scan-details/component-list/stale': typeof SbomScanDetailsComponentListStaleComponent;
  }
}
