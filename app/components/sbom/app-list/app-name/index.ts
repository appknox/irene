import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomProjectListAppNameSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomProjectListAppNameComponent extends Component<SbomProjectListAppNameSignature> {
  @service declare intl: IntlService;

  get packageName() {
    return this.args.sbomProject.project.get('packageName');
  }

  get name() {
    return this.args.sbomProject.project.get('lastFile')?.get('name');
  }

  get isStale() {
    return Boolean(this.args.sbomProject.latestSbFile?.get('isStale'));
  }

  get staleTooltip() {
    return this.intl.t('sbomModule.staleFileTooltip');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::AppName': typeof SbomProjectListAppNameComponent;
    'sbom/app-list/app-name': typeof SbomProjectListAppNameComponent;
  }
}
