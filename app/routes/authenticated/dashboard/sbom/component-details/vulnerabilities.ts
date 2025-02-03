import { service } from '@ember/service';
import Route from '@ember/routing/route';
import type Store from '@ember-data/store';

import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomFileModel from 'irene/models/sbom-file';

export interface SbomAppScanQueryParam {
  vulnerability_limit: string;
  vulnerability_offset: string;
  vulnerability_query: string;
}

export interface SbomAppScanParam extends SbomAppScanQueryParam {
  sbom_project_id: string;
  sbom_file_id: string;
  sbom_component_id: string;
  sbom_component_parent_id: string;
}

interface ParentModel {
  sbomComponent: SbomComponentModel;
  sbomProject: SbomProjectModel;
  sbomFile: SbomFileModel;
  projectLastFile: string;
  queryParams: SbomAppScanParam;
}

export interface ComponentDetailsModel {
  sbomComponent: SbomComponentModel;
  projectName: string | undefined;
  queryParams: SbomAppScanQueryParam;
}

export default class ComponentDetailsVulnerabilitiesRoute extends Route {
  @service declare store: Store;

  queryParams = {
    vulnerability_limit: {
      refreshModel: true,
    },
    vulnerability_offset: {
      refreshModel: true,
    },
    vulnerability_query: {
      refreshModel: true,
    },
  };

  model(params: SbomAppScanQueryParam) {
    const parentModel = this.modelFor(
      'authenticated.dashboard.sbom.component-details'
    ) as ParentModel;

    return {
      ...parentModel,
      queryParams: {
        vulnerability_limit: params.vulnerability_limit || '10',
        vulnerability_offset: params.vulnerability_offset || '0',
        vulnerability_query: params.vulnerability_query || '',
      },
    };
  }
}
