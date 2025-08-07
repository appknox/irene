import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import ClipboardJS from 'clipboard/src/clipboard';

import FileModel from 'irene/models/file';

interface CapturedApisReportDetails {
  type: 'har' | 'json';
  primaryText: string;
  secondaryText: string;
  iconComponent: 'ak-svg/json-report' | 'ak-svg/har-report';
  copyText?: string;
  status?: 'generating' | 'completed' | 'failed';
  generatedDate?: string;
}

export interface FileDetailsApiScanCapturedApisApisDownloadDrawerReportListItemSignature {
  Args: {
    file: FileModel | null;
    reportDetails: CapturedApisReportDetails;
  };
}

export default class FileDetailsApiScanCapturedApisApisDownloadDrawerReportListItemComponent extends Component<FileDetailsApiScanCapturedApisApisDownloadDrawerReportListItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileDetailsApiScanCapturedApisApisDownloadDrawerReportListItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get isReportGenerating() {
    return this.args.reportDetails.status === 'generating';
  }

  get isReportGenerated() {
    return this.args.reportDetails.status === 'completed';
  }

  get isReportGenerateFailed() {
    return this.args.reportDetails.status === 'failed';
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('passwordCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.tPleaseTryAgain);
  }

  handleDownloadReport = task(async (_type: 'har' | 'json') => {
    console.log('downloading report', _type);
  });

  handleGenerateReport = task(async (_type: 'har' | 'json') => {
    console.log('generating report', _type);
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::ApisDownloadDrawer::ReportList::Item': typeof FileDetailsApiScanCapturedApisApisDownloadDrawerReportListItemComponent;
  }
}
