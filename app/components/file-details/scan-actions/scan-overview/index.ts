import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';

export interface FileDetailsScanActionsScanOverviewSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    isDynamicScanAction?: boolean;
  };
}

export default class FileDetailsScanActionsScanOverviewComponent extends Component<FileDetailsScanActionsScanOverviewSignature> {
  get vulnerabilityCount() {
    const vulnerabilityCount = this.args.vulnerabilityCount;

    if (vulnerabilityCount === null) {
      return '-';
    }

    return vulnerabilityCount;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ScanOverview': typeof FileDetailsScanActionsScanOverviewComponent;
  }
}
