import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type ReportRequestModel from 'irene/models/report-request';
import type { ReportRequestPreview } from 'irene/models/report-request';
import type { FilterColumn } from 'irene/components/ai-reporting/preview';

interface AiReportingPreviewFilterDrawerSignature {
  Args: {
    reportRequest: ReportRequestModel;
    reportPreview: ReportRequestPreview | null;
    open: boolean;
    onClose: () => void;
    onApply: (selectedColumns: FilterColumn[]) => void;
    selectedColumnsMap: Map<string, FilterColumn>;
  };
}

export default class AiReportingPreviewFilterDrawer extends Component<AiReportingPreviewFilterDrawerSignature> {
  @tracked selectedColumns: FilterColumn[] = [];

  get reportPreview() {
    return this.args.reportPreview;
  }

  @action
  handleColumnsChange(selectedColumns: FilterColumn[]) {
    this.selectedColumns = [...selectedColumns];
  }

  @action
  applyAndClose() {
    this.args.onApply(this.selectedColumns);
    this.args.onClose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterDrawer': typeof AiReportingPreviewFilterDrawer;
  }
}
