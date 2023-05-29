import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';

import SbomScanModel from 'irene/models/sbom-scan';

export interface SbomScanStatusSignature {
  Args: {
    sbomScan: SbomScanModel | null;
  };
}

export default class SbomScanStatusComponent extends Component<SbomScanStatusSignature> {
  @service declare intl: IntlService;

  get statusValue() {
    if (this.args.sbomScan) {
      return this.args.sbomScan.statusValue;
    }

    return this.intl.t('chipStatus.neverInitiated');
  }

  get statusColor() {
    if (this.args.sbomScan) {
      return this.args.sbomScan.statusColor;
    }

    return 'default';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanStatus': typeof SbomScanStatusComponent;
    'sbom/scan-status': typeof SbomScanStatusComponent;
  }
}
