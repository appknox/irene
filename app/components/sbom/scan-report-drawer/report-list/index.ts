/* eslint-disable ember/no-observers */
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { addObserver, removeObserver } from '@ember/object/observers';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from 'ember-data/store';
import parseError from 'irene/utils/parse-error';

import SbomFileModel from 'irene/models/sbom-file';

import SbomReportModel, { SbomReportStatus } from 'irene/models/sbom-report';
import RealtimeService from 'irene/services/realtime';
import type SbomComponentAdapter from 'irene/adapters/sbom-component';

type SbomScanReportQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomReportModel> & {
    meta: { count: number };
  };

interface AiSummaryResponse {
  total: number;
  by_type: Record<string, number>;
  aibom_supported: boolean;
}

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
  @tracked aiSummaryData: AiSummaryResponse | null = null;

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

  // Mirrors ai-bom-component-list's showAiBomNewFeaturePrompt logic: a
  // pre-AI-BOM scan can still have real components (e.g. detected by a
  // later rescan), so only hide the report when it BOTH predates AI BoM
  // detection AND has zero AI components. aiSummaryData starts null
  // while the fetch is in flight -- treated as "supported" so there's
  // no flash-hide for the common case.
  get aibomSupported() {
    if (this.aiSummaryData === null) {
      return true;
    }

    return (
      this.aiSummaryData.aibom_supported !== false ||
      this.aiSummaryData.total > 0
    );
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
      this.aibomSupported && {
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

  // Same ai_summary endpoint the AI BoM tab uses, fetched independently
  // here purely to read aibom_supported -- this drawer has no other
  // access to that flag.
  fetchAiSummary = task(async () => {
    const sbomFileId = this.args.sbomFile?.id;

    if (!sbomFileId) {
      return;
    }

    const adapter = this.store.adapterFor(
      'sbom-component'
    ) as SbomComponentAdapter;

    const baseUrl = adapter._buildNestedURL('sbom-component', sbomFileId);

    try {
      this.aiSummaryData = (await adapter.ajax(
        `${baseUrl}/ai_summary`,
        'GET'
      )) as AiSummaryResponse;
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
