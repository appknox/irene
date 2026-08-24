/* eslint-disable ember/no-observers */
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { addObserver, removeObserver } from '@ember/object/observers';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import { SbomReportStatus } from 'irene/models/sbom-report';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomReportModel from 'irene/models/sbom-report';
import type RealtimeService from 'irene/services/realtime';
import type SbomComponentAdapter from 'irene/adapters/sbom-component';
import type { SbomAiSummaryResponse } from 'irene/adapters/sbom-component';

type SbomScanReportQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomReportModel> & {
    meta: { count: number };
  };

export interface SbomScanReportDrawerReportListSignature {
  Args: {
    sbomFile: SbomFileModel | null;
  };
}

export default class SbomScanReportDrawerReportListComponent extends Component<SbomScanReportDrawerReportListSignature> {
  @service declare realtime: RealtimeService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked scanReportQueryResponse: SbomScanReportQueryResponse | null = null;
  @tracked aiSummaryData: SbomAiSummaryResponse | null = null;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomScanReportDrawerReportListSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchSbomScanReports.perform();
    this.fetchAiSummary.perform();

    addObserver(
      this.realtime,
      'SbomReportCounter',
      this,
      this.observeSbomReportCounter
    );
  }

  willDestroy() {
    super.willDestroy();

    this.removeSbomReportCounterObserver();
  }

  get sbomReports() {
    return this.scanReportQueryResponse?.slice() || [];
  }

  get totalSbomScanReportCount() {
    return this.scanReportQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomScanReport() {
    return this.totalSbomScanReportCount === 0;
  }

  get latestSbomScanReport() {
    return this.sbomReports.find((report) => report.reportType !== 'ai_bom');
  }

  get latestAiBomScanReport() {
    return this.sbomReports.find((report) => report.reportType === 'ai_bom');
  }

  /**
   * Whether to offer the AI BoM report at all. A scan with zero AI components
   * would only ever produce an empty report, so the row is dropped rather than
   * shown -- regardless of aibom_supported, which only says whether the scan
   * ran with AI detection. A null summary (request still in flight or failed)
   * keeps the row so it does not flicker in and out on every drawer open.
   */
  get hasAiBomComponents() {
    if (this.aiSummaryData === null) {
      return true;
    }

    return this.aiSummaryData.total > 0;
  }

  get reportDetails() {
    const details = [
      {
        type: 'pdf' as const,
        primaryText: this.intl.t('sbomModule.sbomDownloadPdfPrimaryText'),
        secondaryText: this.intl.t('reportPasswordDetail', {
          password: this.latestSbomScanReport?.reportPassword || '',
        }),
        copyText: this.latestSbomScanReport?.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        status: this.latestSbomScanReport?.pdfStatus,
        sbomReport: this.latestSbomScanReport,
      },
      this.hasAiBomComponents && {
        type: 'pdf' as const,
        primaryText: this.intl.t('sbomModule.aiBomDownloadPdfPrimaryText'),
        secondaryText: this.intl.t('reportPasswordDetail', {
          password: this.latestAiBomScanReport?.reportPassword || '',
        }),
        copyText: this.latestAiBomScanReport?.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        status: this.latestAiBomScanReport?.pdfStatus,
        sbomReport: this.latestAiBomScanReport,
      },
      {
        type: 'cyclonedx_json_file' as const,
        primaryText: this.intl.t('sbomModule.sbomDownloadJsonPrimaryText'),
        secondaryText: this.intl.t('sbomModule.sbomDownloadJsonSecondaryText'),
        iconComponent: 'ak-svg/json-report' as const,
        status: SbomReportStatus.COMPLETED,
        sbomReport: this.latestSbomScanReport,
      },
    ] as const;

    return details.filter(
      (detail): detail is Exclude<(typeof details)[number], false> =>
        Boolean(detail)
    );
  }

  observeSbomReportCounter() {
    this.latestSbomScanReport?.reload();
    this.latestAiBomScanReport?.reload();
  }

  removeSbomReportCounterObserver() {
    removeObserver(
      this.realtime,
      'SbomReportCounter',
      this,
      this.observeSbomReportCounter
    );
  }

  fetchSbomScanReports = task(async () => {
    try {
      this.scanReportQueryResponse = (await this.store.query('sbom-report', {
        sbomFileId: this.args.sbomFile?.id,
      })) as SbomScanReportQueryResponse;
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  // Fetch ai_summary independently to read aibom_supported, which this drawer cannot access otherwise.
  fetchAiSummary = task(async () => {
    const sbomFileId = this.args.sbomFile?.id;

    if (!sbomFileId) {
      return;
    }

    const adapter = this.store.adapterFor(
      'sbom-component'
    ) as SbomComponentAdapter;

    try {
      this.aiSummaryData = await adapter.getAiSummary(sbomFileId);
    } catch (error) {
      this.aiSummaryData = null;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer::ReportList': typeof SbomScanReportDrawerReportListComponent;
  }
}
