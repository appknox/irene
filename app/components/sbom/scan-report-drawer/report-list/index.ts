import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import SbomReportModel, { SbomReportStatus } from 'irene/models/sbom-report';
import type SbomFileModel from 'irene/models/sbom-file';
import type RealtimeService from 'irene/services/realtime';

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

  constructor(
    owner: unknown,
    args: SbomScanReportDrawerReportListSignature['Args']
  ) {
    super(owner, args);

    this.fetchSbomScanReports.perform();
  }

  get reloadSbomScanReportsDependencies() {
    return {
      sbomReportCounter: () => this.realtime.SbomReportCounter,
    };
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
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
    return this.sbomReports[0];
  }

  get reportDetails() {
    return [
      {
        type: 'pdf' as const,
        primaryText: this.intl.t('sbomModule.sbomDownloadPdfPrimaryText'),
        secondaryText: this.intl.t('sbomModule.sbomDownloadPdfSecondaryText', {
          password: this.latestSbomScanReport?.reportPassword || '',
        }),
        copyText: this.latestSbomScanReport?.reportPassword,
        iconComponent: 'ak-svg/pdf-report' as const,
        status: this.latestSbomScanReport?.pdfStatus,
      },
      {
        type: 'cyclonedx_json_file' as const,
        primaryText: this.intl.t('sbomModule.sbomDownloadJsonPrimaryText'),
        secondaryText: this.intl.t('sbomModule.sbomDownloadJsonSecondaryText'),
        iconComponent: 'ak-svg/json-report' as const,
        status: SbomReportStatus.COMPLETED,
      },
    ];
  }

  @action
  triggerReloadLatestSbomScanReport() {
    this.reloadLatestSbomScanReport.perform();
  }

  reloadLatestSbomScanReport = task(async () => {
    await this.latestSbomScanReport?.reload();
  });

  fetchSbomScanReports = task(async () => {
    try {
      this.scanReportQueryResponse = (await this.store.query('sbom-report', {
        sbomFileId: this.args.sbomFile?.id,
      })) as SbomScanReportQueryResponse;
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer::ReportList': typeof SbomScanReportDrawerReportListComponent;
  }
}
