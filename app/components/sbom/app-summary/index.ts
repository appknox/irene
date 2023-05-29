import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomAppSummarySignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
  Blocks: {
    default: [];
    actionBtn: [];
  };
}

export default class SbomAppSummaryComponent extends Component<SbomAppSummarySignature> {
  get packageName() {
    return this.args.sbomProject.project.get('packageName');
  }

  get name() {
    return this.args.sbomProject.project.get('lastFile')?.get('name');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppSummary': typeof SbomAppSummaryComponent;
  }
}
