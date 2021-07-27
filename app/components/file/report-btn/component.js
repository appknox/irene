import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { REPORT } from 'irene/utils/constants';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { addObserver, removeObserver } from '@ember/object/observers';
import { htmlSafe } from '@ember/template';

export default class FileReportBtn extends Component {
  // Dependencies
  @service store;
  @service intl;
  @service('notifications') notify;
  @service realtime;

  // Properties
  @tracked reports = [];
  @tracked isDropdownOpen = false;
  @tracked isShowCopyPasswordModal = false;
  @tracked isReportGenerating = false;
  modelName = 'file-report';

  get isStaticScanCompleted() {
    return this.args.file.isStaticCompleted;
  }

  get fileId() {
    return this.args.file.id;
  }

  get latestReport() {
    return this.reports.length ? this.reports.firstObject : {};
  }

  get canGenerateReport() {
    return this.args.file.canGenerateReport;
  }

  /**
   * Property will return previous reports based on the current state
   */
  get prevReports() {
    const noOfReports = this.reports.length;
    if (
      this.canGenerateReport &&
      !this.latestReport.isGenerating &&
      noOfReports === 1
    ) {
      return this.reports;
    } else if (
      this.canGenerateReport &&
      !this.latestReport.isGenerating &&
      noOfReports > 1
    ) {
      return this.reports.slice(0, REPORT.MAX_LIMIT - 1);
    } else if (noOfReports > 1) {
      return this.reports.slice(1, REPORT.MAX_LIMIT);
    }
    return [];
  }

  get enableBtn() {
    return (
      ((this.canGenerateReport &&
        this.args.file.isStaticDone &&
        !this.isReportGenerating) ||
        this.latestReport.isGenerated ||
        this.args.file.isDynamicStatusInProgress ||
        this.args.file.isRunningApiScan ||
        this.args.isSecurityDashboard) &&
      !this.latestReport.isGenerating
    );
  }

  get btnLabel() {
    let btnLabel = this.intl.t('generateReport');
    if (this.latestReport.isGenerating || this.isReportGenerating) {
      btnLabel = this.intl.t('generatingReport');
    } else if (this.canGenerateReport) {
      btnLabel = this.intl.t('generateReport');
    } else if (this.latestReport.isGenerated) {
      btnLabel = this.intl.t('downloadReport');
    }
    return btnLabel;
  }

  get reportGenerationProgress() {
    return htmlSafe(`width: ${this.latestReport.progress}%`);
  }

  constructor() {
    super(...arguments);
    addObserver(
      this.realtime,
      'ReportCounter',
      this,
      this.observeReportCounter
    );
  }

  willDestroy() {
    super.willDestroy(...arguments);
    removeObserver(
      this.realtime,
      'ReportCounter',
      this,
      this.observeReportCounter
    );
  }

  // Actions

  @action
  onGenerateReport() {
    if (this.canGenerateReport) {
      this.generateReport.perform();
    } else if (this.latestReport.isGenerated) {
      this.getReportByType.perform(REPORT.TYPE.PDF, this.latestReport.id);
    } else {
      this.generateReport.perform();
    }
  }

  @action
  onToggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @action
  initializeComp() {
    this.getReports.perform();
  }

  @action
  onCloseModal() {
    this.isShowCopyPasswordModal = false;
  }

  // Events

  observeReportCounter() {
    this.getReports.perform();
  }

  // Methods

  /**
   * Method to generate a new report
   */
  @task(function* () {
    this.isReportGenerating = true;
    try {
      const genReport = yield this.store.createRecord(this.modelName, {
        fileId: this.fileId,
      });
      yield genReport.save();
      yield this.getReports.perform();
      this.notify.success(this.intl.t('reportIsGettingGenerated'));
      this.isReportGenerating = false;
    } catch (error) {
      this.notify.error(parseError(error), this.intl.t('reportGenerateError'));
    }
  })
  generateReport;

  /**
   * Method to get reports under a file
   */
  @task(function* () {
    const query = {
      fileId: this.fileId,
      limit: REPORT.MAX_LIMIT,
    };
    try {
      this.reports = yield this.store.query(this.modelName, query);
    } catch {
      this.reports = [];
    }
  })
  getReports;

  /**
   * Method to get/download pdf/type based report
   */
  @task(function* (type, reportId) {
    triggerAnalytics('feature', ENV.csb.reportDownload);
    const adapter = this.store.adapterFor(this.modelName);
    try {
      const report = yield adapter.getReportByType(
        this.modelName,
        reportId,
        type
      );
      if (report && report.url) {
        window.location = report.url;
        this.isShowCopyPasswordModal = true;
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch {
      this.notify.error(this.intl.t('reportIsGettingGenerated'));
    }
  })
  getReportByType;
}
