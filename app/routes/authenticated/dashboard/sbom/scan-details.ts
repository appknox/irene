import { service } from '@ember/service';
import type Store from '@ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type SbomScanDetailsService from 'irene/services/sbom-scan-details';

export interface SbomComponentQueryParam {
  component_limit: number;
  component_offset: number;
  component_query: string;
  view_type: 'tree' | 'list';
  component_type: number | null;
  is_dependency: string | null;
}

export interface SbomScanDetailParam extends SbomComponentQueryParam {
  sbom_project_id: string;
  sbom_file_id: string;
}

export default class AuthenticatedDashboardSbomScanDetailsRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;
  @service('sbom-scan-details')
  declare sbomScanDetailsService: SbomScanDetailsService;

  queryParams = {
    component_limit: {
      refreshModel: false,
    },
    component_offset: {
      refreshModel: false,
    },
    component_query: {
      refreshModel: false,
    },
    view_type: {
      refreshModel: false,
    },
    component_type: {
      refreshModel: false,
    },
    is_dependency: {
      refreshModel: false,
    },
  };

  async model(params: SbomScanDetailParam) {
    const { sbom_project_id, sbom_file_id } = params;

    const sbomProject = await this.store.findRecord(
      'sbom-project',
      sbom_project_id
    );

    const sbomFile = await this.store.findRecord('sbom-file', sbom_file_id);

    const sbomScanSummary = await this.store.queryRecord('sbom-scan-summary', {
      sbomProjectId: sbom_project_id,
      sbomFileId: sbom_file_id,
    });

    const sbomPrj = await sbomProject.get('project');
    const projectLastFile = sbomPrj.get('lastFile');
    const projectLastFileName = projectLastFile?.name;

    return {
      projectLastFileName,
      sbomProject,
      sbomFile,
      sbomScanSummary,
      queryParams: params,
    };
  }
}
