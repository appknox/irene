import Component from '@glimmer/component';

export interface SecurityAnalysisDetailsAttachmentsFileChipSignature {
  Element: HTMLSpanElement;
  Args: {
    name: string;
    extension?: string | null;
    isUploading?: boolean;
    removeDisabled?: boolean;
    onView: () => void;
    onRemove: () => void;
    onDownload?: () => void;
  };
}

export default class SecurityAnalysisDetailsAttachmentsFileChipComponent extends Component<SecurityAnalysisDetailsAttachmentsFileChipSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Attachments::FileChip': typeof SecurityAnalysisDetailsAttachmentsFileChipComponent;
  }
}
