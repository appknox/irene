import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from '@ember-data/store';
import parseError from 'irene/utils/parse-error';

import SbomScanModel from 'irene/models/sbom-scan';

import SbomScanReportModel, {
  SbomScanReportStatus,
} from 'irene/models/sbom-scan-report';

type SbomScanReportQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomScanReportModel> & {
    meta: { count: number };
  };

export interface SbomScanReportDrawerReportListSignature {
  Args: {
    sbomScan: SbomScanModel | null;
  };
}

export default class SbomScanReportDrawerReportListComponent extends Component<SbomScanReportDrawerReportListSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked scanReportQueryResponse: SbomScanReportQueryResponse | null = null;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomScanReportDrawerReportListSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchSbomScanReports.perform();
  }

  get sbomScanReports() {
    return this.scanReportQueryResponse?.toArray() || [];
  }

  get totalSbomScanReportCount() {
    return this.scanReportQueryResponse?.meta?.count || 0;
  }

  get hasNoSbomScanReport() {
    return this.totalSbomScanReportCount === 0;
  }

  get latestSbomScanReport() {
    return this.sbomScanReports[0];
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
        status: SbomScanReportStatus.COMPLETED,
      },
    ];
  }

  fetchSbomScanReports = task(async () => {
    try {
      this.scanReportQueryResponse = (await this.store.query(
        'sbom-scan-report',
        {
          sbomScanId: this.args.sbomScan?.id,
        }
      )) as SbomScanReportQueryResponse;
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
