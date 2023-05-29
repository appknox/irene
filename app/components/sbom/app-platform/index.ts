import Component from '@glimmer/component';
import SbomAppModel from 'irene/models/sbom-app';

export interface SbomAppPlatformSignature {
  Element: HTMLDivElement;
  Args: {
    sbomApp?: SbomAppModel;
    bordered?: boolean;
  };
}

export default class SbomAppPlatformComponent extends Component<SbomAppPlatformSignature> {
  get platformIconClass() {
    return this.args.sbomApp?.project.get('platformIconClass');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppPlatform': typeof SbomAppPlatformComponent;
    'sbom/app-platform': typeof SbomAppPlatformComponent;
  }
}
