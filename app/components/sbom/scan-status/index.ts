import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';

import SbomFileModel from 'irene/models/sbom-file';

export interface SbomScanStatusSignature {
  Args: {
    sbomFile: SbomFileModel | null;
  };
}

export default class SbomScanStatusComponent extends Component<SbomScanStatusSignature> {
  @service declare intl: IntlService;

  get statusValue() {
    if (this.args.sbomFile) {
      return this.args.sbomFile.statusValue;
    }

    return this.intl.t('chipStatus.neverInitiated');
  }

  get statusColor() {
    if (this.args.sbomFile) {
      return this.args.sbomFile.statusColor;
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
