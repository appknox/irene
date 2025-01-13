import { service } from '@ember/service';
import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
import type DynamicScanService from 'irene/services/dynamic-scan';

interface DynamicScanSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
  Blocks: {
    default: [];
  };
}

export default class DynamicScan extends Component<DynamicScanSignature> {
  @service declare dynamicScan: DynamicScanService;

  constructor(owner: unknown, args: DynamicScanSignature['Args']) {
    super(owner, args);

    this.dynamicScan.fetchLatestScans(this.args.file);
  }

  willDestroy(): void {
    super.willDestroy();

    this.dynamicScan.resetScans();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan': typeof DynamicScan;
  }
}
