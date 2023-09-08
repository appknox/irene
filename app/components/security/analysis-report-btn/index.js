import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

export default class SecurityFileAnalysisReportBtnComponent extends Component {
  @service intl;
  @service('notifications') notify;
  @service ajax;

  @tracked isShowGenerateReportModal = false;
  @tracked emailsToSend = '';
  @tracked sentEmailIds = [];
  @tracked isReportGenerated = false;
  modelName = 'security/file-report';

  get externalReportTypes() {
    return [
      {
        label: this.intl.t('excelReport'),
        format: 'xlsx',
        icon: 'description',
      },
      {
        label: this.intl.t('jaHTMLReport'),
        format: 'html_ja',
        icon: 'integration-instructions',
      },
      {
        label: this.intl.t('enHTMLReport'),
        format: 'html_en',
        icon: 'integration-instructions',
      },
    ];
  }

  get fileId() {
    return this.args.file.id;
  }

  @action
  onGenerateReport() {
    this.isShowGenerateReportModal = true;
    this.isReportGenerated = false;
  }

  @action
  onReGenerateReport() {
    this.isShowGenerateReportModal = true;
  }

  @action
  onCloseModal() {
    this.isShowCopyPasswordModal = false;
    this.isShowGenerateReportModal = false;
  }

  /**
   * Method to re-generate a new report from security dashboard
   */
  @task(function* () {
    const emails = this.emailsToSend;
    let data = {};
    if (!isEmpty(emails)) {
      data = {
        emails: emails.split(',').map((item) => item.trim()),
      };
    }

    try {
      const url = [ENV.endpoints.reports, this.fileId].join('/');
      yield this.ajax.put(url, {
        namespace: 'api/hudson-api',
        data,
        contentType: 'application/json',
      });

      this.isReportGenerated = true;
      this.emailsToSend = '';
      this.sentEmailIds = data.emails;
    } catch (error) {
      this.notify.error(parseError(error), this.intl.t('pleaseTryAgain'));
    }
  })
  generateReport;

  /**
   * Method to download excel report
   */
  @task(function* (type) {
    try {
      const url = [ENV.endpoints.reports, this.fileId, 'download_url'].join(
        '/'
      );
      const data = yield this.ajax.request(url, {
        namespace: 'api/hudson-api',
      });
      if (data && data[type.format]) {
        window.location = data[type.format];
      } else {
        this.notify.error(
          this.intl.t('noReportExists', { format: type.label })
        );
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  })
  downloadReport;
}
