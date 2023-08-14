import Component from '@glimmer/component';
import { FileCompareTableData } from 'irene/components/file-compare/table';

interface FileCompareTableRiskTypeSignature {
  Args: {
    comparison: FileCompareTableData;
  };
}

export default class FileCompareTableRiskTypeComponent extends Component<FileCompareTableRiskTypeSignature> {
  get comparison() {
    return this.args.comparison;
  }

  // Row types
  get isFirstRow() {
    return 'file1' in this.comparison;
  }

  get isVulnerabilityRow() {
    return 'analysis1' in this.comparison || 'analysis2' in this.comparison;
  }

  // Data for first row
  get file1() {
    if ('file1' in this.comparison) {
      return this.comparison.file1;
    }

    return null;
  }

  get file2() {
    if ('file1' in this.comparison) {
      return this.comparison.file2;
    }

    return null;
  }

  get file1Analysis() {
    if ('analysis1' in this.comparison) {
      return this.comparison.analysis1;
    }

    return null;
  }

  get file2Analysis() {
    if ('analysis2' in this.comparison) {
      return this.comparison.analysis2;
    }

    return null;
  }

  get fileAnalyses() {
    return [this.file1Analysis, this.file2Analysis];
  }
}
