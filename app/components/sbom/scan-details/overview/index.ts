import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';

export interface SbomScanDetailsOverviewSignature {
  Element: HTMLElement;
  Args: {
    sbomScanSummary: SbomScanSummaryModel | null;
  };
}

export default class SbomScanDetailsOverviewComponent extends Component<SbomScanDetailsOverviewSignature> {
  @service declare intl: IntlService;

  get scanSummary() {
    return [
      {
        iconName: 'ph:diamonds-four' as const,
        label: this.intl.t('sbomModule.totalComponents'),
        value: this.args.sbomScanSummary?.componentCount || 0,
        isPrimary: true,
      },
      {
        iconName: 'solar:library-linear' as const,
        label: this.intl.t('library'),
        value: this.args.sbomScanSummary?.libraryCount || 0,
      },
      {
        iconName: 'mynaui:frame' as const,
        label: this.intl.t('framework'),
        value: this.args.sbomScanSummary?.frameworkCount || 0,
      },
      {
        iconName: 'draft-outline' as const,
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
