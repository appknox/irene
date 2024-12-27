import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';

import type IntlService from 'ember-intl/services/intl';
import type SecurityFileModel from 'irene/models/security/file';
import type IreneAjaxService from 'irene/services/ajax';

export interface SecurityFileAnalysisReportBtnSignature {
  Element: HTMLElement;
  Args: {
    file: SecurityFileModel;
  };
}

type DownloadReportsResponse = {
  xlsx: string;
  html_en: string;
  html_ja: string;
};

type DownloadReportType = {
  label: string;
  format: keyof DownloadReportsResponse;
  icon: string;
};

export default class SecurityFileAnalysisReportBtnComponent extends Component<SecurityFileAnalysisReportBtnSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare ajax: IreneAjaxService;

  @tracked isShowGenerateReportModal = false;
  @tracked emailsToSend = '';
  @tracked sentEmailIds: string[] = [];
  @tracked isReportGenerated = false;
  @tracked reportMoreMenuRef: HTMLElement | null = null;

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

  get emailList() {
    return this.emailsToSend
      .split(',')
      .filter((e) => Boolean(e.trim()))
      .map((e) => e.trim());
  }

  @action
  handleEmailDelete(index: number) {
    const el = this.emailList;

    el.splice(index, 1);

    this.emailsToSend = el.join(', ');
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
    this.isShowGenerateReportModal = false;
  }

  @action
  handleReportMoreMenuOpen(event: MouseEvent) {
    this.reportMoreMenuRef = event.currentTarget as HTMLElement;
  }

  @action
  handleReportMoreMenuClose() {
    this.reportMoreMenuRef = null;
  }

  /**
   * Method to re-generate a new report from security dashboard
   */
  generateReport = task(async () => {
    const emails = this.emailsToSend;
    let data: { emails?: string[] } = {};

    if (!isEmpty(emails)) {
      data = {
        emails: emails.split(',').map((item) => item.trim()),
      };
    }

    try {
      const url = [ENV.endpoints['reports'], this.fileId].join('/');

      await this.ajax.put(url, {
        namespace: 'api/hudson-api',
        data,
      });

      this.isReportGenerated = true;
      this.emailsToSend = '';
      this.sentEmailIds = data.emails as string[];
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  /**
   * Method to download excel report
   */
  downloadReport = task(async (type: DownloadReportType) => {
    try {
      const url = [ENV.endpoints['reports'], this.fileId, 'download_url'].join(
        '/'
      );

      const data = await this.ajax.request<DownloadReportsResponse>(url, {
        namespace: 'api/hudson-api',
      });

      if (data && data[type.format]) {
        this.window.open(data[type.format], '_blank');
      } else {
        this.notify.error(
          this.intl.t('noReportExists', { format: type.label })
        );
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisReportBtn': typeof SecurityFileAnalysisReportBtnComponent;
  }
}
