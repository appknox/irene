import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import { SbomScanStatus } from 'irene/models/sbom-file';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomScanDetailsService from 'irene/services/sbom-scan-details';

export interface SbomScanDetailsOverviewSignature {
  Args: {
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
  };
}

export default class SbomScanDetailsOverviewComponent extends Component<SbomScanDetailsOverviewSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @service('sbom-scan-details')
  declare sbomScanDetailsService: SbomScanDetailsService;

  get scanStatusCompleted() {
    return this.args.sbomFile.status === SbomScanStatus.COMPLETED;
  }

  @action
  handleMLModelsClick() {
    const queryParams = {
      is_ai_component: 'true',
      view_type: 'list',
      component_offset: 0,
    };

    this.router.transitionTo({ queryParams });

    this.sbomScanDetailsService
      .setQueryData({ is_ai_component: 'true', view_type: 'list' })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  get scanSummary() {
    return [
      {
        iconName: 'ph:diamonds-four' as const,
        label: this.intl.t('sbomModule.totalComponents'),
        value: this.args.sbomScanSummary?.componentCount || 0,
      },
      {
        iconName: 'hugeicons:ai-brain-04' as const,
        label: this.intl.t('sbomModule.mlModel'),
        value: this.args.sbomScanSummary?.machineLearningModelCount || 0,
        newFeature: true,
        isClickable: (this.args.sbomScanSummary?.machineLearningModelCount || 0) > 0,
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
