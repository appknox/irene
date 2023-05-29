import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import Component from '@glimmer/component';

import SbomAppModel from 'irene/models/sbom-app';
import SbomScanModel from 'irene/models/sbom-scan';
import SbomScanComponentModel from 'irene/models/sbom-scan-component';
import IntlService from 'ember-intl/services/intl';

export interface SbomScanDetailsComponentDetailsSummarySignature {
  Element: HTMLDivElement;
  Args: {
    sbomApp: SbomAppModel;
    sbomScanComponent: SbomScanComponentModel | null;
    sbomScan: SbomScanModel;
  };
}

export default class SbomScanDetailsComponentDetailsSummaryComponent extends Component<SbomScanDetailsComponentDetailsSummarySignature> {
  @service declare intl: IntlService;

  get componentSummary() {
    return [
      {
        label: this.intl.t('sbomModule.componentName'),
        value: this.args.sbomScanComponent?.name,
      },
      {
        label: this.intl.t('sbomModule.componentType'),
        value: capitalize(this.args.sbomScanComponent?.type || ''),
      },
      {
        label: this.intl.t('version'),
        value: this.args.sbomScanComponent?.version,
      },
      {
        label: this.intl.t('sbomModule.latestVersion'),
        value: this.args.sbomScanComponent?.latestVersion,
      },
      {
        label: this.intl.t('author'),
        value: this.args.sbomScanComponent?.author,
      },
      {
        label: this.intl.t('license'),
        value: this.args.sbomScanComponent?.licenses.join(', '),
        isLast: true,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentDetails::Summary': typeof SbomScanDetailsComponentDetailsSummaryComponent;
    'sbom/scan-details/component-details/summary': typeof SbomScanDetailsComponentDetailsSummaryComponent;
  }
}
