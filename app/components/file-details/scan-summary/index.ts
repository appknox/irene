import Component from '@glimmer/component';
import AnalysisModel from 'irene/models/analysis';
import FileModel from 'irene/models/file';

export interface FileDetailsScanSummarySignature {
  Args: {
    file: FileModel;
    fileAnalyses: AnalysisModel[];
    previousFileAnalyses: AnalysisModel[];
  };
}

export default class FileDetailsScanSummaryComponent extends Component<FileDetailsScanSummarySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanSummary': typeof FileDetailsScanSummaryComponent;
    'file-details/scan-summary': typeof FileDetailsScanSummaryComponent;
  }
}
