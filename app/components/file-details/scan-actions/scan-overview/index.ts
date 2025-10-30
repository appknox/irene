import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import type FileModel from 'irene/models/file';
import FileRiskModel from 'irene/models/file-risk';
import { tracked } from 'tracked-built-ins';

export interface FileDetailsScanActionsScanOverviewSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    isDynamicScanAction?: boolean;
  };
}

export default class FileDetailsScanActionsScanOverviewComponent extends Component<FileDetailsScanActionsScanOverviewSignature> {
  @tracked fileRisk: FileRiskModel | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsScanActionsScanOverviewSignature['Args']
  ) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get vulnerabilityCount() {
    const vulnerabilityCount = this.args.vulnerabilityCount;

    if (vulnerabilityCount === null) {
      return '-';
    }

    return vulnerabilityCount;
  }

  get vulnerabilityCountByScanType() {
    return this.fileRisk?.get('riskCountByScanType');
  }

  fetchFileRisk = task(async () => {
    this.fileRisk = await this.args.file.fetchFileRisk();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ScanOverview': typeof FileDetailsScanActionsScanOverviewComponent;
  }
}
