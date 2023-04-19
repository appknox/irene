/* eslint-disable ember/no-observers */
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { addObserver, removeObserver } from '@ember/object/observers';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';

import parseError from 'irene/utils/parse-error';
import FileModel from 'irene/models/file';
import RealtimeService from 'irene/services/realtime';
import FileReportModel, { FileReportScanType } from 'irene/models/file-report';
import { REPORT } from 'irene/utils/constants';

type FileReportQueryResponse =
  DS.AdapterPopulatedRecordArray<FileReportModel> & {
    meta: { count: number };
  };

type FileReportIconComponent =
  | 'ak-svg/pdf-report'
  | 'ak-svg/xlsx-icon'
  | 'ak-svg/csv-icon';

export interface FileReportDetails {
  fileReport?: FileReportModel | null;
  type: FileReportScanType;
  iconComponent?: FileReportIconComponent;
  primaryText: string;
  secondaryText: string;
  copyText?: string;
  hideReport?: boolean;
  generatedOnDateTime?: string;
}

export interface FileReportDrawerVaReportsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileReportDrawerVaReportsComponent extends Component<FileReportDrawerVaReportsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked reports: FileReportQueryResponse | null = null;

  modelName = 'file-report' as const;

  constructor(
    owner: unknown,
    args: FileReportDrawerVaReportsSignature['Args']
  ) {
    super(owner, args);

    this.initializeDrawer();
  }

  get file() {
    return this.args.file;
  }

  get canGenerateReport() {
    return this.file.canGenerateReport;
  }

  get hasReports() {
    return Number(this.reports?.length) > 0;
  }

  get latestReport() {
    return this.reports?.firstObject;
  }

  get previousReport() {
    return this.reports?.objectAt(1);
  }

  get latestReportIsGenerating() {
    return this.latestReport?.isGenerating;
  }

  get latestReportIsGenerated() {
    return this.latestReport?.isGenerated;
  }

  get fileId() {
    return this.file.id;
  }

  get isReportGenerating() {
    return this.generateReport.isRunning;
  }

  get enableGenerateBtn() {
    return (
      ((this.canGenerateReport &&
        this.file.isStaticDone &&
        !this.isReportGenerating) ||
        this.latestReportIsGenerated ||
        this.file.isDynamicStatusInProgress ||
        this.file.isRunningApiScan) &&
      !this.latestReportIsGenerating
    );
  }

  get disableGenerateBtn() {
    return !this.enableGenerateBtn;
  }

  get loadingGenerateBtn() {
    return this.isReportGenerating || this.latestReportIsGenerating;
  }

  get btnLabel() {
    let btnLabel = this.intl.t('generateReport');

    if (this.latestReportIsGenerating || this.isReportGenerating) {
      btnLabel = this.intl.t('generatingReport');
    } else if (this.canGenerateReport) {
      btnLabel = this.intl.t('generateReport');
    }

    return btnLabel;
  }

  get reportPassword() {
    return this.file.project.get('pdfPassword');
  }

  get reportDetails(): FileReportDetails[] {
    const xlsxPrimaryText = this.intl.t('fileReport.summaryReport', {
      reportType: 'xlsx',
    });

    const csvPrimaryText = this.intl.t('fileReport.summaryReport', {
      reportType: 'csv',
    });

    const pdfSecondaryText = this.intl.t('fileReport.reportPassword', {
      password: this.reportPassword,
    });

    return [
      {
        fileReport: this.latestReport,
        type: 'pdf' as const,
        primaryText: `${this.intl.t('fileReport.detailedReport', {
          reportType: 'pdf',
        })}`,
        secondaryText: pdfSecondaryText,
        hideReport: !this.latestReport,
        copyText: this.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.latestReport,
        type: 'xlsx' as const,
        primaryText: xlsxPrimaryText,
        secondaryText: `${this.intl.t('fileReport.noPasswordRequired')}`,
        hideReport: !this.latestReport,
        iconComponent: 'ak-svg/xlsx-icon' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.latestReport,
        type: 'csv' as const,
        primaryText: csvPrimaryText,
        secondaryText: `${this.intl.t('fileReport.noPasswordRequired')}`,
        hideReport: !this.latestReport,
        iconComponent: 'ak-svg/csv-icon' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.previousReport,
        type: 'pdf' as const,
        primaryText: `${this.intl.t('fileReport.previousReport', {
          reportType: 'pdf',
        })}`,
        secondaryText: pdfSecondaryText,
        hideReport: !this.previousReport,
        copyText: this.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        generatedOnDateTime: this.previousReport?.generatedOnDateTime,
      },
    ];
  }

  // Actions
  @action
  observeReportCounter() {
    this.getReports.perform();
  }

  @action initializeDrawer() {
    addObserver(
      this.realtime,
      'ReportCounter',
      this,
      this.observeReportCounter
    );

    this.getReports.perform();
  }

  @action removeReportCounterObserver() {
    removeObserver(
      this.realtime,
      'ReportCounter',
      this,
      this.observeReportCounter
    );
  }

  generateReport = task(async () => {
    try {
      const genReport = this.store.createRecord(this.modelName, {
        fileId: this.fileId,
      });

      await genReport.save();
      await this.getReports.perform();

      this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('reportGenerateError')));
    }
  });

  getReports = task(async () => {
    const query = {
      fileId: this.fileId,
      limit: REPORT.MAX_LIMIT,
    };

    try {
      await this.file.reload();

      this.reports = (await this.store.query(
        this.modelName,
        query
      )) as FileReportQueryResponse;
    } catch (err) {
      this.reports = null;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::VaReports': typeof FileReportDrawerVaReportsComponent;
    'file/report-drawer/va-reports': typeof FileReportDrawerVaReportsComponent;
  }
}
