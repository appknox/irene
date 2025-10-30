/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { addObserver, removeObserver } from '@ember/object/observers';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import { REPORT } from 'irene/utils/constants';
import { type FileReportScanType } from 'irene/models/file-report';
import type FileReportModel from 'irene/models/file-report';
import type FileModel from 'irene/models/file';
import type RealtimeService from 'irene/services/realtime';
import DynamicscanModel from 'irene/models/dynamicscan';

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
    closeDrawer: () => void;
  };
}

export default class FileReportDrawerVaReportsComponent extends Component<FileReportDrawerVaReportsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked reports: FileReportQueryResponse | null = null;
  @tracked canGenerateReport = false;
  @tracked lastManualDynamicScan: DynamicscanModel | null = null;
  @tracked lastAutomatedDynamicScan: DynamicscanModel | null = null;

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

  get hasReports() {
    return Number(this.reports?.length) > 0;
  }

  get latestReport() {
    return this.reports?.slice()?.[0];
  }

  get previousReport() {
    return this.reports?.slice()?.[1];
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

  get isDynamicScanRunning() {
    const automated = this.lastAutomatedDynamicScan;
    const manual = this.lastManualDynamicScan;

    return (
      automated?.get('isStartingOrShuttingInProgress') ||
      automated?.get('isReadyOrRunning') ||
      manual?.get('isStartingOrShuttingInProgress') ||
      manual?.get('isReadyOrRunning')
    );
  }

  get enableGenerateBtn() {
    return (
      ((this.canGenerateReport &&
        this.file.isStaticDone &&
        !this.isReportGenerating) ||
        this.latestReportIsGenerated ||
        !this.isDynamicScanRunning ||
        !this.file.isRunningApiScan) &&
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
        secondaryText: `${this.intl.t('noPasswordRequired')}`,
        hideReport: !this.latestReport,
        iconComponent: 'ak-svg/xlsx-icon' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.latestReport,
        type: 'csv' as const,
        primaryText: csvPrimaryText,
        secondaryText: `${this.intl.t('noPasswordRequired')}`,
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
    this.getCanGenerateReportStatus.perform();
    this.getFileLatestDynamicScans.perform();
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

      await waitForPromise(genReport.save());
      await this.getReports.perform();

      this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('reportGenerateError')));
    }
  });

  getCanGenerateReportStatus = task(async () => {
    try {
      const status = await this.file.getGenerateReportStatus();
      this.canGenerateReport = status.can_generate_report;
    } catch (error) {
      this.notify.error(parseError(error));
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
      this.notify.error(parseError(err));
      this.reports = null;
    }
  });

  getFileLatestDynamicScans = task(async () => {
    try {
      this.lastAutomatedDynamicScan =
        await this.file.getFileLastAutomatedDynamicScan();

      this.lastManualDynamicScan =
        await this.file.getFileLastManualDynamicScan();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::VaReports': typeof FileReportDrawerVaReportsComponent;
    'file/report-drawer/va-reports': typeof FileReportDrawerVaReportsComponent;
  }
}
