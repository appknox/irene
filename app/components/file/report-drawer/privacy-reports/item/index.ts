/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type PrivacyReportModel from 'irene/models/privacy-report';
import type ClipboardJS from 'clipboard/src/clipboard';
import type RealtimeService from 'irene/services/realtime';
import type FileModel from 'irene/models/file';
import type OrganizationService from 'irene/services/organization';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface FileReportDrawerPrivacyReportsItemSignature {
  Args: {
    file?: FileModel | null;
    loading?: boolean;
    privacyReport: PrivacyReportModel | null;
  };
}

export default class FileReportDrawerPrivacyReportsItemComponent extends Component<FileReportDrawerPrivacyReportsItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare realtime: RealtimeService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare privacyModule: PrivacyModuleService;

  // null until the dashboard PII flag is known
  @tracked piiEnabled: boolean | null = null;
  @tracked piiStatus: number | null = null;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerPrivacyReportsItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    if (this.orgPiiOn && this.args.file) {
      this.fetchPiiState.perform();
    }

    addObserver(
      this.realtime,
      'PrivacyReportCounter',
      this,
      this.observePrivacyReportCounter
    );
  }

  willDestroy() {
    super.willDestroy();

    this.removePrivacyReportCounterObserver();
  }

  get orgPiiOn() {
    return !!this.organization.selected?.aiFeatures?.pii;
  }

  // PII holds the report back only when both org and dashboard AI flags are on
  fetchPiiState = task(async () => {
    try {
      const aiFeatures = await this.store.queryRecord(
        'organization-ai-feature',
        {}
      );

      this.piiEnabled = aiFeatures.pii;

      if (this.piiEnabled) {
        const pii = await this.privacyModule.getPiiRequest.perform(
          this.args.file?.id
        );

        this.piiStatus = pii.status;
      }
    } catch (e) {
      const error = e as AdapterError;

      // no PII request yet is not an error here
      if (error.errors?.[0]?.status !== '404') {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  });

  // PII state not known yet: show a placeholder instead of a wrong-state button
  get generateLoading() {
    return (
      this.orgPiiOn && this.piiEnabled !== false && this.fetchPiiState.isRunning
    );
  }

  get generateDisabled() {
    if (!this.orgPiiOn || this.piiEnabled === false) {
      return false;
    }

    return (
      this.piiStatus === ENUMS.PM_PII_STATUS.STARTED ||
      this.piiStatus === ENUMS.PM_PII_STATUS.PENDING
    );
  }

  get privacyReport() {
    return this.args.privacyReport;
  }

  get reportPasswordText() {
    return this.intl.t('reportPasswordDetail', {
      password: this.privacyReport?.reportPassword || '',
    });
  }

  observePrivacyReportCounter() {
    this.privacyReport?.reload();
  }

  removePrivacyReportCounterObserver() {
    removeObserver(
      this.realtime,
      'PrivacyReportCounter',
      this,
      this.observePrivacyReportCounter
    );
  }

  get isReportGenerating() {
    return (
      this.privacyReport?.pdfStatus === ENUMS.PM_REPORT_STATUS.STARTED ||
      this.privacyReport?.pdfStatus === ENUMS.PM_REPORT_STATUS.IN_PROGRESS
    );
  }

  get isReportGenerated() {
    return this.privacyReport?.pdfStatus === ENUMS.PM_REPORT_STATUS.COMPLETED;
  }

  get showGenerateReport() {
    return (
      this.privacyReport?.refreshAvailable ||
      this.isReportGenerating ||
      !this.isReportGenerated
    );
  }

  get isGenerateButtonLoading() {
    return this.handleGenerateReport.isRunning || this.isReportGenerating;
  }

  get generateButtonLabel() {
    return this.isGenerateButtonLoading
      ? `${this.intl.t('generating')}...`
      : this.intl.t('generateReport');
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

  handleDownloadReport = task(async () => {
    try {
      const data = await waitForPromise(
        (this.privacyReport as PrivacyReportModel).downloadReport()
      );

      this.window.open(data.url, '_blank');
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  handleGenerateReport = task(async () => {
    try {
      await waitForPromise(
        (this.privacyReport as PrivacyReportModel).generateReport()
      );

      await waitForPromise((this.privacyReport as PrivacyReportModel).reload());
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::PrivacyReports::Item': typeof FileReportDrawerPrivacyReportsItemComponent;
  }
}
