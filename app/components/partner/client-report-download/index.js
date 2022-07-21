/* eslint-disable ember/no-array-prototype-extensions */
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { REPORT } from 'irene/utils/constants';
import poll from 'irene/services/poll';
import parseError from 'irene/utils/parse-error';

export default class PartnerClientReportDownloadComponent extends Component {
  @service intl;
  @service store;
  @service partner;
  @service window;
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

  @task(function* (id) {
    try {
      this.latestReport = yield this.store.queryRecord(
        'partner/partnerclient-report',
        {
          clientId: this.args.clientId,
          id: id,
        }
      );
    } catch (err) {
      this.latestReport = {};
    }
  })
  getReport;

  @task(function* () {
    try {
      this.reports = yield this.store.query(
        'partner/partnerclient-file-report',
        {
          clientId: this.args.clientId,
          fileId: this.args.fileId,
          limit: 1,
        }
      );
      if (this.reports.length) {
        yield this.getReport.perform(this.reports.firstObject.id);
        this.pollReportProgress();
      } else {
        this.latestReport = {};
      }
    } catch (err) {
      this.reports = null;
      this.reportListAPIError = true;
    }
  })
  getReports;

  @action
  pollReportProgress() {
    if (this.latestReport.progress == 100) {
      return;
    }
    const reportId = this.latestReport.id;
    if (!reportId) {
      return;
    }
    let stopPoll = poll(async () => {
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

  @task(function* () {
    try {
      let file = yield this.store.queryRecord('partner/partnerclient-file', {
        clientId: this.args.clientId,
        id: this.args.fileId,
      });
      yield file.createReport(this.args.clientId, this.args.fileId, {});
      yield this.getReports.perform();
      this.pollReportProgress();
      yield this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('reportGenerateError')));
    }
  })
  generatePDFReport;

  @action
  onGenerate() {
    this.generatePDFReport.perform();
  }

  @task(function* (reportId) {
    try {
      const adapter = this.store.adapterFor('file-report');
      const pdfReport = yield adapter.getReportByType(
        'file-report',
        reportId,
        REPORT.TYPE.PDF
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
  })
  downloadPDFReport;

  @action
  onDownload(reportId) {
    this.downloadPDFReport.perform(reportId);
  }
}
