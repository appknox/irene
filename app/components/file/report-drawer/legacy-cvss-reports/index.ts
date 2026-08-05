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
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import { REPORT } from 'irene/utils/constants';
import { type FileReportScanType } from 'irene/models/file-report';
import type FileLegacyCvssReportModel from 'irene/models/file-legacy-cvss-report';
import type FileModel from 'irene/models/file';
import type RealtimeService from 'irene/services/realtime';
import type IreneAjaxService from 'irene/services/ajax';
import type DynamicscanModel from 'irene/models/dynamicscan';

type FileLegacyCvssReportQueryResponse =
  DS.AdapterPopulatedRecordArray<FileLegacyCvssReportModel> & {
    meta: { count: number };
  };

type LegacyCvssReportIconComponent =
  | 'ak-svg/pdf-report'
  | 'ak-svg/xlsx-icon'
  | 'ak-svg/csv-icon';

export interface FileLegacyCvssReportDetails {
  fileReport?: FileLegacyCvssReportModel | null;
  type: FileReportScanType;
  iconComponent?: LegacyCvssReportIconComponent;
  primaryText: string;
  secondaryText: string;
  copyText?: string;
  hideReport?: boolean;
  generatedOnDateTime?: string;
}

export interface FileReportDrawerLegacyCvssReportsSignature {
  Args: {
    file: FileModel;
    closeDrawer: () => void;
  };
}

export default class FileReportDrawerLegacyCvssReportsComponent extends Component<FileReportDrawerLegacyCvssReportsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked reports: FileLegacyCvssReportQueryResponse | null = null;
  @tracked canGenerateReport = false;
  @tracked lastManualDynamicScan: DynamicscanModel | null = null;
  @tracked lastAutomatedDynamicScan: DynamicscanModel | null = null;

  modelName = 'file-legacy-cvss-report' as const;

  constructor(
    owner: unknown,
    args: FileReportDrawerLegacyCvssReportsSignature['Args']
  ) {
    super(owner, args);

    addObserver(
      this.realtime,
      'LegacyCVSSReportCounter',
      this,
      this.observeReportCounter
    );

    this.getReports.perform();
    this.getCanGenerateReportStatus.perform();
    this.getFileLatestAutoDynamicScans.perform();
    this.getFileLatestManualDynamicScans.perform();
  }

  get file() {
    return this.args.file;
  }

  get fileId() {
    return this.file.id;
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

  get showGenerateCta() {
    return !this.hasReports || this.canGenerateReport;
  }

  get btnLabel() {
    if (this.latestReportIsGenerating || this.isReportGenerating) {
      return this.intl.t('generatingReport');
    }

    return this.intl.t('generateReport');
  }

  get reportPassword() {
    return this.file.project.get('pdfPassword');
  }

  get reportDetails(): FileLegacyCvssReportDetails[] {
    const pdfSecondaryText = this.intl.t('reportPasswordDetail', {
      password: this.reportPassword,
    });

    return [
      {
        fileReport: this.latestReport,
        type: 'pdf' as const,
        primaryText: `${this.intl.t('fileReport.detailedReport', { reportType: 'pdf' })}`,
        secondaryText: pdfSecondaryText,
        hideReport: !this.latestReport,
        copyText: this.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.latestReport,
        type: 'xlsx' as const,
        primaryText: `${this.intl.t('fileReport.summaryReport', { reportType: 'xlsx' })}`,
        secondaryText: `${this.intl.t('noPasswordRequired')}`,
        hideReport: !this.latestReport,
        iconComponent: 'ak-svg/xlsx-icon' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.latestReport,
        type: 'csv' as const,
        primaryText: `${this.intl.t('fileReport.summaryReport', { reportType: 'csv' })}`,
        secondaryText: `${this.intl.t('noPasswordRequired')}`,
        hideReport: !this.latestReport,
        iconComponent: 'ak-svg/csv-icon' as const,
        generatedOnDateTime: this.latestReport?.generatedOnDateTime,
      },
      {
        fileReport: this.previousReport,
        type: 'pdf' as const,
        primaryText: `${this.intl.t('fileReport.previousReport', { reportType: 'pdf' })}`,
        secondaryText: pdfSecondaryText,
        hideReport: !this.previousReport,
        copyText: this.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        generatedOnDateTime: this.previousReport?.generatedOnDateTime,
      },
    ];
  }

  @action
  observeReportCounter() {
    this.getReports.perform();
    this.getCanGenerateReportStatus.perform();
  }

  @action
  removeReportCounterObserver() {
    removeObserver(
      this.realtime,
      'LegacyCVSSReportCounter',
      this,
      this.observeReportCounter
    );
  }

  generateReport = task(async () => {
    try {
      await waitForPromise(
        this.ajax.post(`v2/files/${this.fileId}/legacy_cvss_reports`, {})
      );

      await this.getReports.perform();

      this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('reportGenerateError')));
    }
  });

  getCanGenerateReportStatus = task(async () => {
    const status = await waitForPromise(this.file.getGenerateReportStatus());
    this.canGenerateReport = status.can_generate_legacy_report;
  });

  getReports = task(async () => {
    try {
      this.reports = (await this.store.query(this.modelName, {
        fileId: this.fileId,
        limit: REPORT.MAX_LIMIT,
      })) as FileLegacyCvssReportQueryResponse;
    } catch (err) {
      this.notify.error(parseError(err));
      this.reports = null;
    }
  });

  getFileLatestAutoDynamicScans = task(async () => {
    const scans = await waitForPromise(
      this.file.getFileLastAutomatedDynamicScan()
    );

    this.lastAutomatedDynamicScan = scans[0] ?? null;
  });

  getFileLatestManualDynamicScans = task(async () => {
    const scans = await waitForPromise(
      this.file.getFileLastManualDynamicScan()
    );

    this.lastManualDynamicScan = scans[0] ?? null;
  });

  willDestroy() {
    super.willDestroy();
    this.removeReportCounterObserver();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::LegacyCvssReports': typeof FileReportDrawerLegacyCvssReportsComponent;
    'file/report-drawer/legacy-cvss-reports': typeof FileReportDrawerLegacyCvssReportsComponent;
  }
}
