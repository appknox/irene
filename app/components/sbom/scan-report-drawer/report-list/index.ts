/* eslint-disable ember/no-observers */
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { addObserver, removeObserver } from '@ember/object/observers';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Store from '@ember-data/store';
import parseError from 'irene/utils/parse-error';

import SbomFileModel from 'irene/models/sbom-file';

import SbomReportModel, { SbomReportStatus } from 'irene/models/sbom-report';
import RealtimeService from 'irene/services/realtime';

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

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SbomScanReportDrawerReportListSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchSbomScanReports.perform();

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
    return this.scanReportQueryResponse?.toArray() || [];
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

  observeSbomReportCounter() {
    this.latestSbomScanReport?.reload();
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanReportDrawer::ReportList': typeof SbomScanReportDrawerReportListComponent;
  }
}
