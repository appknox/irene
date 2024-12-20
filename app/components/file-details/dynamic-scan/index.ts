import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';

interface DynamicScanSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
  Blocks: {
    default: [];
  };
}

export default class DynamicScan extends Component<DynamicScanSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan': typeof DynamicScan;
  }
}
