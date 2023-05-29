import Component from '@glimmer/component';

export interface SbomProjectListNoScanAlertSignature {
  Args: {
    onClose: () => void;
  };
}

export default class SbomProjectListNoScanAlertComponent extends Component<SbomProjectListNoScanAlertSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::NoScanAlert': typeof SbomProjectListNoScanAlertComponent;
    'sbom/app-list/no-scan-alert': typeof SbomProjectListNoScanAlertComponent;
  }
}
