import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';

import parseError from 'irene/utils/parse-error';
import ClipboardJS from 'clipboard/src/clipboard';

import SbomReportModel, {
  SbomReportStatus,
  SbomReportType,
} from 'irene/models/sbom-report';

interface SbomScanReportDetails {
  type: SbomReportType;
  primaryText: string;
  secondaryText: string;
  iconComponent: 'ak-svg/json-report' | 'ak-svg/pdf-report';
  copyText?: string;
  status?: SbomReportStatus;
}

export interface SbomScanReportDrawerReportListItemSignature {
  Args: {
    sbomReport?: SbomReportModel;
    reportDetails: SbomScanReportDetails;
  };
}

export default class SbomScanReportDrawerReportListItemComponent extends Component<SbomScanReportDrawerReportListItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomScanReportDrawerReportListItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get sbomReport() {
    return this.args.sbomReport;
  }

  get isReportGenerating() {
    return (
      this.args.reportDetails.status === SbomReportStatus.STARTED ||
      this.args.reportDetails.status === SbomReportStatus.IN_PROGRESS
    );
  }

  get isReportGenerated() {
    return this.args.reportDetails.status === SbomReportStatus.COMPLETED;
  }

  get isReportGenerateFailed() {
    return this.args.reportDetails.status === SbomReportStatus.FAILED;
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('passwordCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.tPleaseTryAgain);
  }

  handleDownloadReport = task(async (type: SbomReportType) => {
    try {
      const data = await this.sbomReport?.downloadReport(type);

      if (data) {
        this.window.open(data.url, '_blank');
      }
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  handleGenerateReport = task(async (type: SbomReportType) => {
    try {
      await this.sbomReport?.generateReport(type);
      await this.sbomReport?.reload();
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer::ReportList::Item': typeof SbomScanReportDrawerReportListItemComponent;
  }
}
