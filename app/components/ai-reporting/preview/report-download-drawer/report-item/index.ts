import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type ReportRequestModel from 'irene/models/ai-reporting/report-request';
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
  handleReportTypeSelect() {
    this.args.onReportTypeSelect(this.reportType);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::ReportDownloadDrawer::ReportItem': typeof AiReportingPreviewReportDownloadDrawerReportItemComponent;
  }
}
