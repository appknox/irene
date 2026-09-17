import Component from '@glimmer/component';

export interface VncViewerCyodDownloadLinkSignature {
  Element: HTMLElement;

  Args: {
    url?: string | null;
    isIos?: boolean;
  };
}

export default class VncViewerCyodDownloadLinkComponent extends Component<VncViewerCyodDownloadLinkSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'VncViewer::CyodDownloadLink': typeof VncViewerCyodDownloadLinkComponent;
    'vnc-viewer/cyod-download-link': typeof VncViewerCyodDownloadLinkComponent;
  }
}
