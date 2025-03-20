import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomAppPlatformSignature {
  Element: HTMLElement;
  Args: {
    sbomProject?: SbomProjectModel;
    bordered?: boolean;
  };
}

export default class SbomAppPlatformComponent extends Component<SbomAppPlatformSignature> {
  get platformIconClass() {
    return this.args.sbomProject?.project.get('platformIconClass');
  }

  get platformIconName() {
    return this.platformIconClass === 'apple' ? 'fa-brands:apple' : 'android';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppPlatform': typeof SbomAppPlatformComponent;
    'sbom/app-platform': typeof SbomAppPlatformComponent;
  }
}
