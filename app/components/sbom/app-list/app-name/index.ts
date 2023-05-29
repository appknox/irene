import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';

export interface SbomProjectListAppNameSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomProjectListAppNameComponent extends Component<SbomProjectListAppNameSignature> {
  get packageName() {
    return this.args.sbomProject.project.get('packageName');
  }

  get name() {
    return this.args.sbomProject.project.get('lastFile')?.get('name');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::AppName': typeof SbomProjectListAppNameComponent;
    'sbom/app-list/app-name': typeof SbomProjectListAppNameComponent;
  }
}
