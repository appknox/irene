import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import { REPORT } from 'irene/utils/constants';
import type FileModel from 'irene/models/file';
import type RealtimeService from 'irene/services/realtime';

import FileCapiReportModel, {
  type FileCapiReportScanType,
} from 'irene/models/file-capi-report';

type FileCapiReportQueryResponse =
  DS.AdapterPopulatedRecordArray<FileCapiReportModel> & {
    meta: { count: number };
  };

type FileCapiReportIconComponent = 'ak-svg/har-report' | 'ak-svg/json-report';

export interface FileCapiReportDetails {
  capiReport: FileCapiReportModel | null;
  type: FileCapiReportScanType;
  iconComponent?: FileCapiReportIconComponent;
  primaryText: string;
  secondaryText: string;
  copyText?: string;
  generatedOnDateTime?: string;
  isOutdated?: boolean;
  reportGenerationFailed?: boolean;
}

export interface FileDetailsDynamicScanResultsCapisReportDrawerSignature {
  Args: {
    file: FileModel;
    closeDrawer: () => void;
  };
}

export default class FileDetailsDynamicScanResultsCapisReportDrawerComponent extends Component<FileDetailsDynamicScanResultsCapisReportDrawerSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked reports: FileCapiReportQueryResponse | null = null;
  @tracked latestHarReport: FileCapiReportModel | null = null;
  @tracked latestJsonReport: FileCapiReportModel | null = null;

  modelName = 'file-capi-report' as const;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanResultsCapisReportDrawerSignature['Args']
  ) {
    super(owner, args);

    this.getLatestReports.perform();
  }

  get file() {
    return this.args.file;
  }

  get supportedReportTypes(): FileCapiReportScanType[] {
    return ['har', 'json'];
  }

  get hasReports() {
    return Number(this.reports?.length) > 0;
  }

  get latestReportArray() {
    return this.reports?.slice();
  }

  get latestReportIsGenerating() {
    return (
      this.latestReportArray?.some((report) => report.isGenerating) ?? false
    );
  }

  get latestReportsProgress() {
    const cumulativeProgress = this.latestReportArray?.reduce(
      (acc, report) => acc + report.progress,
      0
    );

    return (cumulativeProgress ?? 0) / (this.latestReportArray?.length ?? 1);
  }

  get reportsAreGenerated() {
    return (
      this.latestReportArray?.every((report) => report.isGenerated) ?? false
    );
  }

  get fileId() {
    return this.file.id;
  }

  get isReportGenerating() {
    return this.generateReport.isRunning;
  }

  get enableGenerateBtn() {
    return !this.latestReportIsGenerating;
  }

  get showGenerateFilesCTA() {
    return this.latestReportArray?.length === 0;
  }

  get disableGenerateBtn() {
    return !this.enableGenerateBtn;
  }

  get btnLabel() {
    let btnLabel = this.intl.t('apiScanModule.generateFiles');

    if (this.latestReportIsGenerating || this.isReportGenerating) {
      btnLabel = this.intl.t('apiScanModule.generatingFiles');
    }

    return btnLabel;
  }

  get reportDetails(): FileCapiReportDetails[] {
    return [
      {
        capiReport: this.latestHarReport,
        type: 'har' as const,
        primaryText: this.intl.t('apiScanModule.harFile'),
        secondaryText: this.intl.t('noPasswordRequired'),
        iconComponent: 'ak-svg/har-report' as const,
        generatedOnDateTime: this.latestHarReport?.generatedOnDateTime,
        isOutdated: this.latestHarReport?.isOutdated,
        reportGenerationFailed: this.latestHarReport?.reportGenerationFailed,
      },
      {
        capiReport: this.latestJsonReport,
        type: 'json' as const,
        primaryText: this.intl.t('apiScanModule.jsonFile'),
        secondaryText: this.intl.t('noPasswordRequired'),
        iconComponent: 'ak-svg/json-report' as const,
        generatedOnDateTime: this.latestJsonReport?.generatedOnDateTime,
        isOutdated: this.latestJsonReport?.isOutdated,
        reportGenerationFailed: this.latestJsonReport?.reportGenerationFailed,
      },
    ];
  }

  @action
  updateLatestReport(
    report: FileCapiReportModel | null,
    type: FileCapiReportScanType
  ) {
    if (type === 'har') {
      this.latestHarReport = report;
    } else if (type === 'json') {
      this.latestJsonReport = report;
    }
  }

  @action
  updateLatestJsonReport(report: FileCapiReportModel | null) {
    this.latestJsonReport = report;
  }

  generateReport = task(async () => {
    try {
      await waitForPromise(
        this.file.generateCapiReports(this.supportedReportTypes)
      );

      await this.getLatestReports.perform();
      this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('reportGenerateError')));
    }
  });

  getLatestReports = task(async () => {
    const query = {
      fileId: this.fileId,
      limit: REPORT.MAX_LIMIT,
      latest: true,
    };

    try {
      await this.file.reload();

      const reports = await this.store.query('file-capi-report', query);
      this.reports = reports as FileCapiReportQueryResponse;

      // Expecting only one har and one json report from endpoint
      //  If reports have already been generated
      reports.forEach((report) =>
        this.updateLatestReport(report, report.fileType)
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::CapisReportDrawer': typeof FileDetailsDynamicScanResultsCapisReportDrawerComponent;
  }
}
