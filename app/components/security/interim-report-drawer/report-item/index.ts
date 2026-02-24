import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ClipboardJS from 'clipboard/src/clipboard';

import parseError from 'irene/utils/parse-error';
import type { InterimReportDetails } from 'irene/components/security/interim-report-drawer';

export interface SecurityInterimReportDrawerReportItemSignature {
  Element: HTMLElement;
  Args: {
    regenerateReport: () => void;
    regenerateReportTaskIsRunning: boolean;
    reportDetails: InterimReportDetails;
  };
}

export default class SecurityInterimReportDrawerReportItemComponent extends Component<SecurityInterimReportDrawerReportItemSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked enabledForCustomer = false;
  @tracked canGenerateReport = false;
  @tracked toggleConfirmBoxOpen = false;
  @tracked pendingToggleState = false;
  @tracked previousToggleState = false;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: SecurityInterimReportDrawerReportItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.enabledForCustomer =
      this.args.reportDetails.interimReport.isVisibleToCustomer ?? false;

    this.fetchCanGenerateReport.perform();
  }

  get interimReport() {
    return this.args.reportDetails.interimReport;
  }

  get isReportGenerating() {
    return this.interimReport.isGenerating;
  }

  get isReportGenerated() {
    return this.interimReport.isGenerated;
  }

  get isNewReportAvailable() {
    return this.canGenerateReport;
  }

  get reportType() {
    return this.args.reportDetails.type;
  }

  get showDownloadButton() {
    return !this.isReportGenerating;
  }

  get showGeneratingText() {
    return this.isReportGenerating;
  }

  get reportIsDownloading() {
    return this.downloadReport.isRunning;
  }

  get toggleConfirmBoxDescription() {
    return this.pendingToggleState
      ? 'Turning this toggle on will enable the interim report to be viewed by the customer. Are you sure you want to proceed?'
      : 'Turning this toggle off will disable the interim report from being viewed by the customer. Are you sure you want to proceed?';
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

  @action openToggleConfirmBox(event: Event, checked?: boolean) {
    this.previousToggleState = this.enabledForCustomer;
    this.pendingToggleState = checked ?? !this.enabledForCustomer;
    this.enabledForCustomer = this.pendingToggleState;
    this.toggleConfirmBoxOpen = true;
  }

  @action closeToggleConfirmBox() {
    this.enabledForCustomer = this.previousToggleState;
    this.toggleConfirmBoxOpen = false;
  }

  @action toggleEnabledForCustomer() {
    this.toggleCustomerVisibilityTask.perform();
  }

  @action getReport() {
    this.downloadReport.perform();
  }

  toggleCustomerVisibilityTask = task(async () => {
    try {
      await waitForPromise(
        this.interimReport.toggleCustomerVisibility(this.pendingToggleState)
      );

      await waitForPromise(this.interimReport.reload());

      this.toggleConfirmBoxOpen = false;

      if (this.enabledForCustomer) {
        this.notify.success('Interim report enabled for customer');
      } else {
        this.notify.success('Interim report disabled for customer');
      }
    } catch (error) {
      this.enabledForCustomer = this.previousToggleState;
      this.toggleConfirmBoxOpen = false;

      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });

  fetchCanGenerateReport = task(async () => {
    try {
      const adapter = this.store.adapterFor('interim-report');
      const { fileId } = this.args.reportDetails;
      const result = await waitForPromise(
        adapter.canGenerateInterimReport(fileId)
      );

      this.canGenerateReport = result.can_generate;
    } catch {
      this.canGenerateReport = false;
    }
  });

  downloadReport = task(async () => {
    try {
      const data = await waitForPromise(this.interimReport.downloadReport());

      if (data?.url) {
        this.window.open(data.url, '_blank');
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch {
      this.notify.error(this.intl.t('reportIsGettingGenerated'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::InterimReportDrawer::ReportItem': typeof SecurityInterimReportDrawerReportItemComponent;
  }
}
