import Component from '@glimmer/component';
import SbomAppModel from 'irene/models/sbom-app';

export interface SbomAppListAppNameSignature {
  Args: {
    sbomApp: SbomAppModel;
  };
}

export default class SbomAppListAppNameComponent extends Component<SbomAppListAppNameSignature> {
  get packageName() {
    return this.args.sbomApp.project.get('packageName');
  }

  get name() {
    return this.args.sbomApp.project.get('lastFile')?.get('name');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::AppName': typeof SbomAppListAppNameComponent;
    'sbom/app-list/app-name': typeof SbomAppListAppNameComponent;
  }
}
