/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { addObserver, removeObserver } from '@ember/object/observers';
import IntlService from 'ember-intl/services/intl';

import Store from '@ember-data/store';

import RealtimeService from 'irene/services/realtime';
import FileModel from 'irene/models/file';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

export interface FileDetailsDynamicScanResultsApisDownloadDrawerReportListSignature {
  Args: {
    file: FileModel | null;
  };
}

export default class FileDetailsDynamicScanResultsApisDownloadDrawerReportListComponent extends Component<FileDetailsDynamicScanResultsApisDownloadDrawerReportListSignature> {
  @service declare realtime: RealtimeService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showReportList = false;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanResultsApisDownloadDrawerReportListSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchGeneratedCapturedApisReportFiles.perform();

    addObserver(
      this.realtime,
      'CapturedApisReportCounter',
      this,
      this.observeCapturedApisReportCounter
    );
  }

  willDestroy() {
    super.willDestroy();

    this.removeCapturedApisReportCounterObserver();
  }

  get hasNoCapturedApisReport() {
    return this.realtime.CapturedApisReportCounter === 0;
  }

  get reportDetails() {
    return [
      {
        type: 'har' as const,
        primaryText: 'HAR File',
        secondaryText: 'No Password Required',
        iconComponent: 'ak-svg/har-report' as const,
        status: 'completed' as const,
        generatedDate: dayjs().format('DD MMM YYYY, HH:mm A'),
      },
      {
        type: 'json' as const,
        primaryText: 'JSON File',
        secondaryText: 'No Password Required',
        iconComponent: 'ak-svg/json-report' as const,
        status: 'completed' as const,
        generatedDate: dayjs().format('DD MMM YYYY, HH:mm A'),
      },
    ];
  }

  observeCapturedApisReportCounter() {}

  removeCapturedApisReportCounterObserver() {
    removeObserver(
      this.realtime,
      'CapturedApisReportCounter',
      this,
      this.observeCapturedApisReportCounter
    );
  }

  generateReport = task(async (type: 'har' | 'json') => {
    console.log('generating report', type);
    this.showReportList = true;
  });

  fetchGeneratedCapturedApisReportFiles = task(async () => {});
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ApisDownloadDrawer::ReportList': typeof FileDetailsDynamicScanResultsApisDownloadDrawerReportListComponent;
  }
}
