import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
import type ManualscanModel from 'irene/models/manualscan';

export interface FileDetailsManualScanRequestFormAdditionalCommentsSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsManualScanRequestFormAdditionalCommentsComponent extends Component<FileDetailsManualScanRequestFormAdditionalCommentsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::RequestForm::AdditionalComments': typeof FileDetailsManualScanRequestFormAdditionalCommentsComponent;
    'file-details/manual-scan/request-form/additional-comments': typeof FileDetailsManualScanRequestFormAdditionalCommentsComponent;
  }
}
