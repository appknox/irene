import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type ClipboardJS from 'clipboard/src/clipboard';

import type ReportRequestModel from 'irene/models/report-request';
import type { AiReportDetails, AiReportType } from '..';

export interface AiReportingPreviewReportDownloadDrawerReportItemSignature {
  Element: HTMLElement;
  Args: {
    reportDetails: AiReportDetails;
    reportRequest: ReportRequestModel;
    selectedReportType: AiReportType;
    onReportTypeSelect: (reportType: AiReportType) => void;
  };
}

export default class AiReportingPreviewReportDownloadDrawerReportItemComponent extends Component<AiReportingPreviewReportDownloadDrawerReportItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare store: Store;

  get reportType() {
    return this.args.reportDetails.type;
  }

  get isSelected() {
    return this.args.selectedReportType === this.reportType;
  }

  get isPregeneratedReport() {
    return ['csv', 'xlsx'].includes(this.reportType);
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('passwordCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.intl.t('pleaseTryAgain'));
  }

  @action
  handleReportTypeSelect() {
    this.args.onReportTypeSelect(this.reportType);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::ReportDownloadDrawer::ReportItem': typeof AiReportingPreviewReportDownloadDrawerReportItemComponent;
  }
}
