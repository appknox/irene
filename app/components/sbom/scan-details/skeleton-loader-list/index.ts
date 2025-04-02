import { service } from '@ember/service';
import Component from '@glimmer/component';

import type IntlService from 'ember-intl/services/intl';

export default class SbomScanDetailsSkeletonLoaderListComponent extends Component {
  @service declare intl: IntlService;

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.componentName'),
        width: 150,
      },
      {
        name: this.intl.t('sbomModule.componentType'),
      },
      {
        name: this.intl.t('dependencyType'),
      },
      {
        name: this.intl.t('status'),
      },
    ];
  }

  get loadingMockData() {
    return new Array(8).fill({});
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SkeletonLoaderList': typeof SbomScanDetailsSkeletonLoaderListComponent;
  }
}
