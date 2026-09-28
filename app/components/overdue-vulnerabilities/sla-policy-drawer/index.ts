import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';

export interface OverdueVulnerabilitiesSlaPolicyDrawerSignature {
  Args: {
    open: boolean;
    file: FileModel;
    onClose: () => void;
  };
}

export default class OverdueVulnerabilitiesSlaPolicyDrawerComponent extends Component<OverdueVulnerabilitiesSlaPolicyDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OverdueVulnerabilities::SlaPolicyDrawer': typeof OverdueVulnerabilitiesSlaPolicyDrawerComponent;
  }
}
