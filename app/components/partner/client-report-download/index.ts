import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import { REPORT } from 'irene/utils/constants';
import type IntlService from 'ember-intl/services/intl';
import type PartnerService from 'irene/services/partner';
import type PollService from 'irene/services/poll';
import type PartnerclientReportModel from 'irene/models/partner/partnerclient-report';
import type PartnerclientFileReportModel from 'irene/models/partner/partnerclient-file-report';
import type { FileReportScanType } from 'irene/models/file-report';

interface PartnerClientReportDownloadComponentSignature {
  Element: HTMLElement;
  Args: {
    clientId: string;
    fileId: string;
  };
}

export default class PartnerClientReportDownloadComponent extends Component<PartnerClientReportDownloadComponentSignature> {
  @service declare intl: IntlService;
  @service declare partner: PartnerService;
  @service declare store: Store;
  @service('browser/window') declare window: Window;
  @service declare poll: PollService;
  @service('notifications') declare notify: NotificationService;

  @tracked reports: PartnerclientFileReportModel[] = [];
  @tracked latestReport: PartnerclientReportModel | null = null;
  @tracked reportListAPIError = false;

  get generationProgressStyle() {
    return htmlSafe(`width: ${this.latestReport?.progress}%`);
  }

  get isGenerating() {
    return this.latestReport && this.latestReport.progress < 100 ? true : false;
  }

  get isDownloadButtonDisabled() {
    return !this.latestReport?.id || this.isGenerating;
  }

  get isGenerateButtonDisabled() {
    return this.reports == null || this.isGenerating;
  }

  getReport = task(async (id) => {
    try {
      this.latestReport = await this.store.queryRecord(
        'partner/partnerclient-report',
        {
          clientId: this.args.clientId,
          id: id,
        }
      );
    } catch (err) {
      this.latestReport = null;
    }
  });

  getReports = task(async () => {
    try {
      const reports = await this.store.query(
        'partner/partnerclient-file-report',
        {
          clientId: this.args.clientId,
          fileId: this.args.fileId,
          limit: 1,
        }
      );

      this.reports = reports.slice();

      if (this.reports.length) {
        await waitForPromise(this.getReport.perform(this.reports[0]?.id));

        this.pollReportProgress();
      } else {
        this.latestReport = null;
      }
    } catch (err) {
      this.reports = [];
      this.reportListAPIError = true;
    }
  });

  @action
  pollReportProgress() {
    if (this.latestReport?.progress == 100) {
      return;
    }

    const reportId = this.latestReport?.id;

    if (!reportId) {
      return;
    }

    const stopPoll = this.poll.startPolling(async () => {
      try {
        const report = await this.store.queryRecord(
          'partner/partnerclient-report',
          {
            clientId: this.args.clientId,
            id: this.reports[0]?.id,
          }
        );

        if (report.progress == 100) {
          stopPoll();
        }
      } catch (err) {
        stopPoll();
      }
    }, 5000);
  }

  generatePDFReport = task(async () => {
    try {
      const file = await this.store.queryRecord('partner/partnerclient-file', {
        clientId: this.args.clientId,
        id: this.args.fileId,
      });

      await waitForPromise(
        file.createReport(this.args.clientId, this.args.fileId, {})
      );

      await waitForPromise(this.getReports.perform());

      this.pollReportProgress();
      this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('reportGenerateError')));
    }
  });

  @action
  onGenerate() {
    this.generatePDFReport.perform();
  }

  downloadPDFReport = task(async (reportId) => {
    try {
      const adapter = this.store.adapterFor('file-report');

      const pdfReport = await waitForPromise(
        adapter.getReportByType(
          'file-report',
          reportId,
          REPORT.TYPE.PDF as FileReportScanType
        )
      );

      if (!pdfReport || !pdfReport.url) {
        throw new Error(this.intl.t('downloadUrlNotFound'));
      }

      const togglePasswordBtn = document.getElementById(
        `password-toggle-${this.latestReport?.id}`
      );

      togglePasswordBtn?.click();

      this.window.open(pdfReport.url);
    } catch {
      this.notify.error(this.intl.t('downloadUrlNotFound'));
    }
  });

  @action
  onDownload(reportId?: string) {
    this.downloadPDFReport.perform(reportId);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientReportDownload': typeof PartnerClientReportDownloadComponent;
  }
}
