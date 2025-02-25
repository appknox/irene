// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { waitForPromise } from '@ember/test-waiters';

import SbomReportModel, { SbomReportType } from 'irene/models/sbom-report';
import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';

type SbomScanReportQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomReportModel> & {
    meta: { count: number };
  };

export default class FileReportDrawerSbomReportsSampleComponent extends Component {
  @service declare ajax: IreneAjaxService;
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

    const storedState = this.window.localStorage.getItem('sbomRequest');

    this.hasContactedSupport = storedState === 'true';

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
      await waitForPromise(this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT));

      this.window.localStorage.setItem('sbomRequest', 'true');

      this.hasContactedSupport = true;
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  fetchSampleReport = task(async () => {
    try {
      this.sampleSbomReport = await waitForPromise(
        this.store.findRecord('sbom-report', 'sample')
      );
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  triggerSampleReportDownload = task(async (type: SbomReportType) => {
    try {
      const data = await waitForPromise(
        (this.sampleSbomReport as SbomReportModel).downloadReport(type)
      );

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
