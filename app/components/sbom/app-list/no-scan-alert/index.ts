import Component from '@glimmer/component';

export interface SbomAppListNoScanAlertSignature {
  Args: {
    onClose: () => void;
  };
}

export default class SbomAppListNoScanAlertComponent extends Component<SbomAppListNoScanAlertSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::NoScanAlert': typeof SbomAppListNoScanAlertComponent;
    'sbom/app-list/no-scan-alert': typeof SbomAppListNoScanAlertComponent;
  }
}
