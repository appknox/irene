import Component from '@glimmer/component';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type FileModel from 'irene/models/file';

export interface FileDetailsScanSummarySignature {
  Args: {
    file: FileModel;
    fileAnalyses: AnalysisOverviewModel[];
    isFetchingAnalyses: boolean;
  };
}

export default class FileDetailsScanSummaryComponent extends Component<FileDetailsScanSummarySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanSummary': typeof FileDetailsScanSummaryComponent;
    'file-details/scan-summary': typeof FileDetailsScanSummaryComponent;
  }
}
