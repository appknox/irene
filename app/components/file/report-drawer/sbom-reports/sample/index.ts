// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';

import NetworkService from 'irene/services/network';
import SbomReportModel, { SbomReportType } from 'irene/models/sbom-report';
import parseError from 'irene/utils/parse-error';

type SbomScanReportQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomReportModel> & {
    meta: { count: number };
  };

export default class FileReportDrawerSbomReportsSampleComponent extends Component {
  @service declare ajax: any;
  @service declare network: NetworkService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked hasContactedSupport = false;
  @tracked sampleSbomReport: SbomReportModel | undefined;
  @tracked scanReportQueryResponse: SbomScanReportQueryResponse | null = null;

  CONTACT_SUPPORT_ENDPOINT = 'v2/feature_request/sbom';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchSampleReport.perform();
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get sampleReportList() {
    return [
      {
        type: 'pdf' as const,
        primaryText: this.intl.t('fileReport.samplePDFReportText'),
        iconComponent: 'ak-svg/pdf-report' as const,
      },
      {
        type: 'cyclonedx_json_file' as const,
        primaryText: this.intl.t('fileReport.sampleJsonReportText'),
        iconComponent: 'ak-svg/json-report' as const,
      },
    ];
  }

  contactSupport = task(async () => {
    try {
      await this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT);
      this.hasContactedSupport = true;
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  fetchSampleReport = task(async () => {
    try {
      this.sampleSbomReport = await this.store.findRecord(
        'sbom-report',
        'sample'
      );
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  triggerSampleReportDownload = task(async (type: SbomReportType) => {
    try {
      const data = await this.sampleSbomReport?.downloadReport(type);
      const { url } = data || {};

      if (url) {
        this.window.open(url, '_blank');
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::SbomReports::Sample': typeof FileReportDrawerSbomReportsSampleComponent;
  }
}
