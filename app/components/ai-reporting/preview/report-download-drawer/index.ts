import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type ReportRequestModel from 'irene/models/report-request';

export type AiReportType = 'xlsx' | 'csv';
export type AiReportIconComponent = 'ak-svg/xlsx-icon' | 'ak-svg/csv-icon';

export interface AiReportDetails {
  type: AiReportType;
  iconComponent?: AiReportIconComponent;
  primaryText: string;
  secondaryText: string;
  copyText?: string;
  hideReport?: boolean;
}

export interface AiReportingPreviewReportDownloadDrawerSignature {
  Args: {
    reportRequest: ReportRequestModel;
    openDrawer: boolean;
    closeDrawer: () => void;
    onDownload: (reportType: AiReportType) => void;
  };
}

export default class AiReportingPreviewReportDownloadDrawerComponent extends Component<AiReportingPreviewReportDownloadDrawerSignature> {
  @service declare intl: IntlService;

  @tracked selectedReportType: AiReportType = this.reportType;

  get reportDetails(): AiReportDetails[] {
    const xlsxPrimaryText = this.intl.t('reportModule.aiReportDownload', {
      reportType: 'xlsx',
    });

    const csvPrimaryText = this.intl.t('reportModule.aiReportDownload', {
      reportType: 'csv',
    });

    return [
      {
        type: 'csv' as const,
        primaryText: csvPrimaryText,
        secondaryText: `${this.intl.t('noPasswordRequired')}`,
        hideReport: false,
        iconComponent: 'ak-svg/csv-icon' as const,
      },
      {
        type: 'xlsx' as const,
        primaryText: xlsxPrimaryText,
        secondaryText: `${this.intl.t('noPasswordRequired')}`,
        hideReport: false,
        iconComponent: 'ak-svg/xlsx-icon' as const,
      },
    ];
  }

  get reportType() {
    return this.args.reportRequest.reportType as AiReportType;
  }

  @action
  handleReportTypeSelect(reportType: AiReportType) {
    this.selectedReportType = reportType;
  }

  @action
  handleDownload() {
    this.args.onDownload(this.selectedReportType);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::ReportDownloadDrawer': typeof AiReportingPreviewReportDownloadDrawerComponent;
  }
}
