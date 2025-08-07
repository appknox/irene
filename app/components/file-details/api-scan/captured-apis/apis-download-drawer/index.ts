import Component from '@glimmer/component';

import FileModel from 'irene/models/file';

export interface FileDetailsApiScanCapturedApisApisDownloadDrawerSignature {
  Args: {
    file: FileModel | null;
    onClose: () => void;
  };
}

export default class FileDetailsApiScanCapturedApisApisDownloadDrawerComponent extends Component<FileDetailsApiScanCapturedApisApisDownloadDrawerSignature> {
  get fileProject() {
    return this.args.file?.project.content;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::ApisDownloadDrawer': typeof FileDetailsApiScanCapturedApisApisDownloadDrawerComponent;
  }
}
