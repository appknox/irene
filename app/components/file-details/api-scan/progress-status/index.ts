import { service } from '@ember/service';
import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';

export interface FileDetailsApiScanProgressStatusSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsApiScanProgressStatusComponent extends Component<FileDetailsApiScanProgressStatusSignature> {
  @service declare apiScan: ApiScanService;

  constructor(
    owner: unknown,
    args: FileDetailsApiScanProgressStatusSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::ProgressStatus': typeof FileDetailsApiScanProgressStatusComponent;
    'file-details/api-scan/progress-status': typeof FileDetailsApiScanProgressStatusComponent;
  }
}
