import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';

export interface PrivacyModuleReportDrawerSignature {
  Args: {
    file?: FileModel | null;
    showAppDetails?: boolean;
    open?: boolean;
    onClose: () => void;
  };
}

export default class PrivacyModuleReportDrawerComponent extends Component<PrivacyModuleReportDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::ReportDrawer': typeof PrivacyModuleReportDrawerComponent;
  }
}
