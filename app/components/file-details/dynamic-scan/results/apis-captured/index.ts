import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type FileModel from 'irene/models/file';

export interface FileDetailsDynamicScanResultsApisCapturedSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsDynamicScanResultsApisCaptured extends Component<FileDetailsDynamicScanResultsApisCapturedSignature> {
  @tracked showCapturedApisDownloadDrawer = false;

  get noApisCaptured() {
    return true;
  }

  @action
  handleDownloadCapturedApis() {
    this.showCapturedApisDownloadDrawer = true;
  }

  @action
  handleClose() {
    this.showCapturedApisDownloadDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ApisCaptured': typeof FileDetailsDynamicScanResultsApisCaptured;
  }
}
