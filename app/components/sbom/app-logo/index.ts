import Component from '@glimmer/component';
import SbomAppModel from 'irene/models/sbom-app';

export interface SbomAppLogoSignature {
  Args: {
    sbomApp?: SbomAppModel;
  };
}

export default class SbomAppLogoComponent extends Component<SbomAppLogoSignature> {
  get iconUrl() {
    return this.args.sbomApp?.project.get('lastFile')?.get('iconUrl');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppLogo': typeof SbomAppLogoComponent;
  }
}
