import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type SbomFileModel from 'irene/models/sbom-file';

export interface SbomAppScanListStaleSignature {
  Args: {
    sbomFile: SbomFileModel;
  };
}

export default class SbomAppScanListStaleComponent extends Component<SbomAppScanListStaleSignature> {
  @service declare intl: IntlService;

  get isStale() {
    return Boolean(this.args.sbomFile?.isStale);
  }

  get tooltip() {
    return this.intl.t('sbomModule.staleFileTooltip');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppScan::List::Stale': typeof SbomAppScanListStaleComponent;
    'sbom/app-scan/list/stale': typeof SbomAppScanListStaleComponent;
  }
}
