import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SbomFileModel, { SbomScanStatus } from 'irene/models/sbom-file';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import styles from './index.scss';

import { SbomComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import SbomProjectModel from 'irene/models/sbom-project';
import SbomScanSummaryModel from 'irene/models/sbom-scan-summary';

export interface SbomScanDetailsSignature {
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    queryParams: SbomComponentQueryParam;
  };
}

export default class SbomScanDetailsComponent extends Component<SbomScanDetailsSignature> {
  @service declare intl: IntlService;

  @tracked openViewReportDrawer = false;

  get classes() {
    return {
      akLinkBtn: styles['ak-link-btn'],
    };
  }

  get packageName() {
    return this.args.sbomProject.project.get('packageName');
  }

  get scanStatusText() {
    if (this.args.sbomFile.status === SbomScanStatus.FAILED) {
      return {
        title: this.intl.t('sbomModule.sbomScanStatusError.title'),
        description: this.intl.t('sbomModule.sbomScanStatusError.description'),
      };
    }

    return {
      title: this.intl.t('sbomModule.sbomScanStatusProgress.title'),
      description: this.intl.t('sbomModule.sbomScanStatusProgress.description'),
    };
  }

  get scanStatusCompleted() {
    return this.args.sbomFile.status === SbomScanStatus.COMPLETED;
  }

  get scanStatusFailed() {
    return this.args.sbomFile.status === SbomScanStatus.FAILED;
  }

  @action
  handleViewReportDrawerOpen() {
    this.openViewReportDrawer = true;
  }

  @action
  handleViewReportDrawerClose() {
    this.openViewReportDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails': typeof SbomScanDetailsComponent;
  }
}
