import Component from '@glimmer/component';
import SbomAppModel from 'irene/models/sbom-app';

export interface SbomScanSummarySignature {
  Args: {
    sbomApp: SbomAppModel;
  };
  Blocks: {
    default: [];
    actionBtn: [];
  };
}

export default class SbomScanSummaryComponent extends Component<SbomScanSummarySignature> {
  get packageName() {
    return this.args.sbomApp.project.get('packageName');
  }

  get name() {
    return this.args.sbomApp.project.get('lastFile')?.get('name');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanSummary': typeof SbomScanSummaryComponent;
  }
}
