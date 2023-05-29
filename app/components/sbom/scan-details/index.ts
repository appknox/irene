import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SbomScanModel, { SbomScanStatus } from 'irene/models/sbom-scan';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import styles from './index.scss';

import { SbomScanComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import SbomAppModel from 'irene/models/sbom-app';
import SbomScanSummaryModel from 'irene/models/sbom-scan-summary';

export interface SbomScanDetailsSignature {
  Args: {
    sbomApp: SbomAppModel;
    sbomScan: SbomScanModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    queryParams: SbomScanComponentQueryParam;
  };
}

export default class SbomScanDetailsComponent extends Component<SbomScanDetailsSignature> {
  @service declare intl: IntlService;

  @tracked openViewReportDrawer = false;
  @tracked showFileScanSummary = false;

  get classes() {
    return {
      akLinkBtn: styles['ak-link-btn'],
    };
  }

  get scanStatusText() {
    if (this.args.sbomScan.status === SbomScanStatus.FAILED) {
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
    return this.args.sbomScan.status === SbomScanStatus.COMPLETED;
  }

  get scanStatusFailed() {
    return this.args.sbomScan.status === SbomScanStatus.FAILED;
  }

  @action
  handleFileScanSummaryToggle() {
    this.showFileScanSummary = !this.showFileScanSummary;
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
