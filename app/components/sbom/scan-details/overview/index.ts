import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { SbomScanStatus } from 'irene/models/sbom-file';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type SbomFileModel from 'irene/models/sbom-file';

export interface SbomScanDetailsOverviewSignature {
  Args: {
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
  };
}

export default class SbomScanDetailsOverviewComponent extends Component<SbomScanDetailsOverviewSignature> {
  @service declare intl: IntlService;

  get scanStatusCompleted() {
    return this.args.sbomFile.status === SbomScanStatus.COMPLETED;
  }

  get scanSummary() {
    return [
      {
        iconName: 'ph:diamonds-four',
        label: this.intl.t('sbomModule.totalComponents'),
        value: this.args.sbomScanSummary?.componentCount || 0,
      },
      {
        iconName: 'hugeicons:ai-brain-04',
        label: this.intl.t('sbomModule.mlModel'),
        value: this.args.sbomScanSummary?.machineLearningModelCount || 0,
        newFeature: true,
      },
      {
        iconName: 'solar:library-linear',
        label: this.intl.t('library'),
        value: this.args.sbomScanSummary?.libraryCount || 0,
      },
      {
        iconName: 'mynaui:frame',
        label: this.intl.t('framework'),
        value: this.args.sbomScanSummary?.frameworkCount || 0,
      },
      {
        iconName: 'draft',
        label: this.intl.t('file'),
        value: this.args.sbomScanSummary?.fileCount || 0,
        hideDivider: true,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::Overview': typeof SbomScanDetailsOverviewComponent;
  }
}
