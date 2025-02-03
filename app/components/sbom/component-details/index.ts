import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomComponentDetailsSignature {
  Args: {
    sbomComponent: SbomComponentModel | null;
  };
  Blocks: {
    default: [];
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

  get componentName() {
    const bomRef = this.args.sbomComponent?.bomRef;

    const truncatedBomRef = bomRef?.substring(0, bomRef.lastIndexOf(':'));
    return `${truncatedBomRef}  :  ${this.args.sbomComponent?.name}`;
  }

  get tabs() {
    return [
      {
        id: 'overview',
        label: this.intl.t('overview'),
        route: 'authenticated.dashboard.sbom.component-details.overview',
        activeRoutes: 'authenticated.dashboard.sbom.component-details.overview',
      },
      {
        id: 'vulnerabilities',
        label: this.intl.t('vulnerabilities'),
        route: 'authenticated.dashboard.sbom.component-details.vulnerabilities',
        activeRoutes:
          'authenticated.dashboard.sbom.component-details.vulnerabilities',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails': typeof SbomComponentDetailsComponent;
  }
}
