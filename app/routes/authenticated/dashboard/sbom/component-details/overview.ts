import type SbomComponentModel from 'irene/models/sbom-component';
import Route from '@ember/routing/route';

export interface SbomAppScanParam {
  sbom_project_id: string;
  sbom_file_id: string;
  sbom_component_id: string;
  sbom_component_parent_id: string;
}

export interface ComponentDetailsModel {
  sbomComponent: SbomComponentModel;
  projectName: string | undefined;
  queryParams: SbomAppScanParam;
}

export default class ComponentDetailsOverviewRoute extends Route {
  model() {
    return this.modelFor('authenticated.dashboard.sbom.component-details');
  }
}
