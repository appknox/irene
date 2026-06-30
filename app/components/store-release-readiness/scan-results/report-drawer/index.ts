import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import type StoreReleaseReadinessReportModel from 'irene/models/store-release-readiness-report';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

export interface StoreReleaseReadinessScanResultsReportDrawerSignature {
  Args: {
    scanData: StoreReleaseReadinessScanModel;
    open: boolean;
    onClose: () => void;
  };
}

export default class StoreReleaseReadinessScanResultsReportDrawerComponent extends Component<StoreReleaseReadinessScanResultsReportDrawerSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked report: StoreReleaseReadinessReportModel | null = null;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: StoreReleaseReadinessScanResultsReportDrawerSignature['Args']
  ) {
    super(owner, args);

    this.fetchReport.perform();

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get initialLoading() {
    return this.report === null && this.fetchReport.isRunning;
  }

  get fileId() {
    return this.args.scanData.file.get('id');
  }

  fetchReport = task(async () => {
    try {
      this.report = await this.store.queryRecord(
        'store-release-readiness-report',
        {
          fileId: String(this.fileId),
        }
      );
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::ReportDrawer': typeof StoreReleaseReadinessScanResultsReportDrawerComponent;
  }
}
