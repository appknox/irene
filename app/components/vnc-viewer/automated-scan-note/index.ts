import Component from '@glimmer/component';

import type DynamicscanModel from 'irene/models/dynamicscan';

export interface VncViewerAutomatedScanNoteSignature {
  Element: HTMLElement;

  Args: {
    dynamicScan?: DynamicscanModel | null;
  };
}

export default class VncViewerAutomatedScanNoteComponent extends Component<VncViewerAutomatedScanNoteSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'VncViewer::AutomatedScanNote': typeof VncViewerAutomatedScanNoteComponent;
    'vnc-viewer/automated-scan-note': typeof VncViewerAutomatedScanNoteComponent;
  }
}
