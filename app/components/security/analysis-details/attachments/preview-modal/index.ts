import Component from '@glimmer/component';

const PREVIEWABLE_IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'webp',
  'svg',
]);

export interface SecurityAnalysisDetailsAttachmentsPreviewModalSignature {
  Args: {
    name: string | null;
    url: string;
    onClose: () => void;
    onOpenInNewTab: () => void;
  };
}

export default class SecurityAnalysisDetailsAttachmentsPreviewModalComponent extends Component<SecurityAnalysisDetailsAttachmentsPreviewModalSignature> {
  get extension() {
    return (this.args.name ?? '').split('.').pop()?.toLowerCase() ?? '';
  }

  get isImage() {
    return PREVIEWABLE_IMAGE_EXTENSIONS.has(this.extension);
  }

  get isPdf() {
    return this.extension === 'pdf';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Attachments::PreviewModal': typeof SecurityAnalysisDetailsAttachmentsPreviewModalComponent;
  }
}
