import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import Component from '@glimmer/component';

import SbomProjectModel from 'irene/models/sbom-project';
import SbomFileModel from 'irene/models/sbom-file';
import SbomComponentModel from 'irene/models/sbom-component';
import IntlService from 'ember-intl/services/intl';

export interface SbomScanDetailsComponentDetailsSummarySignature {
  Element: HTMLDivElement;
  Args: {
    sbomProject: SbomProjectModel;
    sbomComponent: SbomComponentModel | null;
    sbomFile: SbomFileModel;
  };
}

export default class SbomScanDetailsComponentDetailsSummaryComponent extends Component<SbomScanDetailsComponentDetailsSummarySignature> {
  @service declare intl: IntlService;

  get componentSummary() {
    return [
      {
        label: this.intl.t('sbomModule.componentName'),
        value: this.args.sbomComponent?.name,
      },
      {
        label: this.intl.t('sbomModule.componentType'),
        value: capitalize(this.args.sbomComponent?.type || ''),
      },
      {
        label: this.intl.t('version'),
        value: this.args.sbomComponent?.version,
      },
      {
        label: this.intl.t('sbomModule.latestVersion'),
        value: this.args.sbomComponent?.latestVersion,
      },
      {
        label: this.intl.t('author'),
        value: this.args.sbomComponent?.author,
      },
      {
        label: this.intl.t('license'),
        value: this.args.sbomComponent?.licenses.join(', '),
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
