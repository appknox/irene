import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomAppLogoSignature {
  Args: {
    sbomProject?: SbomProjectModel;
  };
}

export default class SbomAppLogoComponent extends Component<SbomAppLogoSignature> {
  get iconUrl() {
    return this.args.sbomProject?.project.get('lastFile')?.get('iconUrl');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppLogo': typeof SbomAppLogoComponent;
  }
}
