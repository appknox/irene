import Component from '@glimmer/component';

export interface FileDetailsDynamicScanPageWrapperComponentSignature {
  Blocks: {
    default: [];
  };
}

export default class FileDetailsDynamicScanPageWrapperComponent extends Component<FileDetailsDynamicScanPageWrapperComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::PageWrapper': typeof FileDetailsDynamicScanPageWrapperComponent;
  }
}
