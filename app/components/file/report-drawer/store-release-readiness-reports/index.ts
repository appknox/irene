import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type StoreReleaseReadinessReportModel from 'irene/models/store-release-readiness-report';

export interface FileReportDrawerStoreReleaseReadinessReportsSignature {
  Args: {
    file: FileModel;
    closeDrawer: () => void;
  };
}

export default class FileReportDrawerStoreReleaseReadinessReportsComponent extends Component<FileReportDrawerStoreReleaseReadinessReportsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked report: StoreReleaseReadinessReportModel | null = null;
  @tracked reportNotAvailable = false;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerStoreReleaseReadinessReportsSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchReport.perform();
  }

  get file() {
    return this.args.file;
  }

  get initialLoading() {
    return this.report === null && this.fetchReport.isRunning;
  }

  fetchReport = task(async () => {
    try {
      this.report = await this.store.queryRecord(
        'store-release-readiness-report',
        { fileId: this.args.file?.id }
      );
    } catch (e) {
      const error = e as AdapterError;

      if (error.errors?.[0]?.status === '404') {
        this.reportNotAvailable = true;
      } else {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::StoreReleaseReadinessReports': typeof FileReportDrawerStoreReleaseReadinessReportsComponent;
    'file/report-drawer/store-release-readiness-reports': typeof FileReportDrawerStoreReleaseReadinessReportsComponent;
  }
}
