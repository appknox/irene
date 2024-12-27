/* eslint-disable ember/no-array-prototype-extensions */
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import { REPORT } from 'irene/utils/constants';
import parseError from 'irene/utils/parse-error';

export default class PartnerClientReportDownloadComponent extends Component {
  @service intl;
  @service store;
  @service partner;
  @service window;
  @service poll;
  @service('notifications') notify;

  @tracked reports = null;
  @tracked latestReport = {};
  @tracked reportListAPIError = false;

  get generationProgressStyle() {
    return htmlSafe(`width: ${this.latestReport.progress}%`);
  }

  get isGenerating() {
    return this.latestReport.progress < 100 ? true : false;
  }

  get isDownloadButtonDisabled() {
    return !this.latestReport.id || this.isGenerating;
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
      this.latestReport = {};
    }
  });

  getReports = task(async () => {
    try {
      this.reports = await this.store.query(
        'partner/partnerclient-file-report',
        {
          clientId: this.args.clientId,
          fileId: this.args.fileId,
          limit: 1,
        }
      );
      if (this.reports.length) {
        await waitForPromise(this.getReport.perform(this.reports[0].id));

        this.pollReportProgress();
      } else {
        this.latestReport = {};
      }
    } catch (err) {
      this.reports = null;
      this.reportListAPIError = true;
    }
  });

  @action
  pollReportProgress() {
    if (this.latestReport.progress == 100) {
      return;
    }

    const reportId = this.latestReport.id;
    if (!reportId) {
      return;
    }

    let stopPoll = this.poll.startPolling(async () => {
      try {
        let report = await this.store.queryRecord(
          'partner/partnerclient-report',
          {
            clientId: this.args.clientId,
            id: this.reports.firstObject.id,
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
      let file = await this.store.queryRecord('partner/partnerclient-file', {
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
        adapter.getReportByType('file-report', reportId, REPORT.TYPE.PDF)
      );

      if (!pdfReport || !pdfReport.url) {
        throw new Error(this.intl.t('downloadUrlNotFound'));
      }

      let togglePasswordBtn = document.getElementById(
        `password-toggle-${this.latestReport.id}`
      );
      togglePasswordBtn.click();

      this.window.locationAssign(pdfReport.url);
    } catch {
      this.notify.error(this.intl.t('downloadUrlNotFound'));
    }
  });

  @action
  onDownload(reportId) {
    this.downloadPDFReport.perform(reportId);
  }
}
