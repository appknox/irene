import { service } from '@ember/service';
import type Store from '@ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomAppScanQueryParam {
  vulnerability_limit: string;
  vulnerability_offset: string;
  vulnerability_query: string;
}

export interface SbomAppScanParam extends SbomAppScanQueryParam {
  sbom_project_id: string;
  sbom_file_id: string;
  sbom_component_id: string;
}

export interface ComponentDetailsModel {
  sbomComponent: SbomComponentModel;
  projectName: string | undefined;
  queryParams: SbomAppScanQueryParam;
}

export default class AuthenticatedDashboardSbomComponentDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
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

  async model(params: SbomAppScanParam) {
    const {
      sbom_component_id,
      vulnerability_limit = '10',
      vulnerability_offset = '0',
      vulnerability_query = '',
    } = params;

    const sbomComponent = await this.store.queryRecord('sbom-component', {
      sbomComponentId: sbom_component_id,
    });

    const sbFileId = sbomComponent.sbFile?.get('id') as string;
    const sbomFile = await this.store.findRecord('sbom-file', sbFileId);
    const sbomProject = await sbomFile?.get('sbProject');
    const sbomPrj = await sbomProject.get('project');
    const projectLastFile = await sbomPrj.get('lastFileId');

    return {
      sbomComponent,
      sbomProject,
      sbomFile,
      projectLastFile,
      queryParams: {
        vulnerability_limit,
        vulnerability_offset,
        vulnerability_query,
      },
    };
  }
}
