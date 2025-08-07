import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type { Task } from 'ember-concurrency';
import type FileModel from 'irene/models/file';

export interface FileDetailsApiScanCapturedApiHeaderSignature {
  Args: {
    allAPIsSelected: boolean;
    selectAllCapturedApis: Task<unknown, [boolean]>;
    handleSelectAllCapturedApis: (event: Event, checked: boolean) => void;
    file: FileModel;
  };
}

export default class FileDetailsApiScanCapturedApiHeaderComponent extends Component<FileDetailsApiScanCapturedApiHeaderSignature> {
  @tracked showCapturedApisDownloadDrawer = true;

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
    'FileDetails::ApiScan::CapturedApis::Header': typeof FileDetailsApiScanCapturedApiHeaderComponent;
  }
}
