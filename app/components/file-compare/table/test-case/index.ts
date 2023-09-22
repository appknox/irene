import Component from '@glimmer/component';
import { FileCompareTableData } from 'irene/components/file-compare/table';

interface FileCompareTableTestCaseSignature {
  Args: {
    comparison: FileCompareTableData;
  };
}

export default class FileCompareTableTestCaseComponent extends Component<FileCompareTableTestCaseSignature> {
  get comparison() {
    return this.args.comparison;
  }

  // Row types
  get isFirstRow() {
    return 'file1' in this.comparison;
  }

  get vulnerabilityName() {
    if (this.comparison.vulnerability) {
      return this.comparison.vulnerability.get('name');
    }

    return '';
  }
}
