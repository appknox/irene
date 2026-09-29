import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type SbomProjectModel from 'irene/models/sbom-project';

export interface SbomAppListStaleSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomAppListStaleComponent extends Component<SbomAppListStaleSignature> {
  @service declare intl: IntlService;

  get isStale() {
    return Boolean(this.args.sbomProject.latestSbFile?.get('isStale'));
  }

  get tooltip() {
    return this.intl.t('sbomModule.staleFileTooltip');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::Stale': typeof SbomAppListStaleComponent;
    'sbom/app-list/stale': typeof SbomAppListStaleComponent;
  }
}
