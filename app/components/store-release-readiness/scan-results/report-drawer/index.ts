import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type { StoreReleaseReadinessCardData } from '../../release-card';
import type StoreReleaseReadinessReportModel from 'irene/models/store-release-readiness-report';

export interface StoreReleaseReadinessScanResultsReportDrawerSignature {
  Args: {
    item: StoreReleaseReadinessCardData;
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

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get isReportGenerating() {
    const progress = this.report?.pdfProgress ?? 0;
    const isCompleted =
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.COMPLETED ||
      progress >= 100;

    if (isCompleted) {
      return false;
    }

    return (
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.STARTED ||
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.IN_PROGRESS
    );
  }

  get initialLoading() {
    return this.report === null && this.fetchReport.isRunning;
  }

  fetchReport = task(async () => {
    try {
      this.report = await this.store.queryRecord(
        'store-release-readiness-report',
        {
          scanId: this.args.item.id,
        }
      );
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  pollReportUntilDone = task({ restartable: true }, async () => {
    while (this.args.open) {
      await this.fetchReport.perform();

      if (!this.isReportGenerating) {
        break;
      }

      await timeout(3000);
    }
  });

  @action
  syncReportOnOpen() {
    if (!this.args.open) {
      return;
    }

    this.pollReportUntilDone.perform();
  }

  @action
  handleReportGenerationStarted() {
    this.pollReportUntilDone.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::ReportDrawer': typeof StoreReleaseReadinessScanResultsReportDrawerComponent;
  }
}
