import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ClipboardJS from 'clipboard/src/clipboard';
import { REPORT } from 'irene/utils/constants';
import poll from 'irene/services/poll';

export default class PartnerClientReportDownloadComponent extends Component {
  @service intl;
  @service store;
  @service partner;
  @service('notifications') notify;

  @tracked reports = [];
  @tracked unlockKey = null;
  @tracked latestReport = {};

  @tracked progress = 2;

  get generationProgressStyle() {
    return htmlSafe(`width: ${this.latestReport.progress}%`);
  }

  get isGenerating() {
    return this.latestReport.progress < 100 ? true : false;
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
    var stopPoll = poll(() => {
      return this.store
        .queryRecord('partner/partnerclient-report', {
          clientId: this.args.clientId,
          id: this.reports.firstObject.id,
        })
        .then(
          (report) => {
            if (report.progress == 100) {
              stopPoll();
            }
          },
          () => {
            stopPoll();
          }
        );
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
      this.notify.success(this.intl.t('reportIsGettingGenerated'));
    } catch (error) {
      this.notify.error(error, this.intl.t('reportGenerateError'));
    }
  })
  generatePDFReport;

  @action
  onGenerate() {
    this.generatePDFReport.perform();
  }

  @task(function* (reportId) {
    const adapter = this.store.adapterFor('file-report');
    try {
      const pdfReport = yield adapter.getReportByType(
        'file-report',
        reportId,
        REPORT.TYPE.PDF
      );
      if (pdfReport && pdfReport.url) {
        window.location = pdfReport.url;
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch {
      this.notify.error('Report download failed');
    }
  })
  downloadPDFReport;

  @action
  onDownload(reportId) {
    this.downloadPDFReport.perform(reportId);
  }

  @task(function* (reportId) {
    try {
      this.unlockKey = yield this.store.queryRecord(
        'partner/partnerclient-file-report-unlockkey',
        {
          clientId: this.args.clientId,
          reportId: reportId,
        }
      );
    } catch (err) {
      this.unlockKey = null;
    }
  })
  getUnlockKey;

  @action
  onCopyPassword(reportId) {
    let clipboard = new ClipboardJS(`.copy-unlock-key-${reportId}`);
    clipboard.on('success', (err) => {
      this.notify.info(
        `Report password copied for file ID ${this.args.fileId}`
      );
      err.clearSelection();
      clipboard.destroy();
    });
    clipboard.on('error', () => {
      this.notify.error(this.intl.t('tPleaseTryAgain'));
      clipboard.destroy();
    });
  }
}
