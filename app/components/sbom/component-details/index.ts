import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import SbomComponentModel from 'irene/models/sbom-component';
import IntlService from 'ember-intl/services/intl';

export interface SbomComponentDetailsSignature {
  Args: {
    sbomComponent: SbomComponentModel | null;
  };
}

export default class SbomComponentDetailsComponent extends Component<SbomComponentDetailsSignature> {
  @service declare intl: IntlService;

  get sbomFile() {
    return this.args.sbomComponent?.sbFile;
  }

  get sbomProject() {
    return this.sbomFile?.get('sbProject');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails': typeof SbomComponentDetailsComponent;
  }
}
