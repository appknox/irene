import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

export interface SbomComponentQueryParam {
  component_limit: string;
  component_offset: string;
  component_query: string;
}

export interface SbomScanDetailParam extends SbomComponentQueryParam {
  sbom_project_id: string;
  sbom_file_id: string;
}

export default class AuthenticatedDashboardSbomScanDetailsRoute extends Route {
  @service declare store: Store;

  queryParams = {
    component_limit: {
      refreshModel: true,
    },
    component_offset: {
      refreshModel: true,
    },
    component_query: {
      refreshModel: true,
    },
  };

  async model(params: SbomScanDetailParam) {
    const {
      sbom_project_id,
      sbom_file_id,
      component_limit = '25',
      component_offset = '0',
      component_query = '',
    } = params;

    const sbomProject = await this.store.findRecord(
      'sbom-project',
      sbom_project_id
    );

    const sbomFile = await this.store.findRecord('sbom-file', sbom_file_id);

    const sbomScanSummary = await this.store.queryRecord('sbom-scan-summary', {
      sbomProjectId: sbom_project_id,
      sbomFileId: sbom_file_id,
    });

    return {
      sbomProject,
      sbomFile,
      sbomScanSummary,
      queryParams: { component_limit, component_offset, component_query },
    };
  }
}
