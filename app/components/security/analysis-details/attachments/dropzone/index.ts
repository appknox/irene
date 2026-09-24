import Component from '@glimmer/component';

import type { UploadFile } from 'ember-file-upload';

export interface SecurityAnalysisDetailsAttachmentsDropzoneSignature {
  Element: HTMLElement;
  Args: {
    isUploading?: boolean;
    onFileAdded: (file: UploadFile) => void;
  };
}

export default class SecurityAnalysisDetailsAttachmentsDropzoneComponent extends Component<SecurityAnalysisDetailsAttachmentsDropzoneSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Attachments::Dropzone': typeof SecurityAnalysisDetailsAttachmentsDropzoneComponent;
  }
}
