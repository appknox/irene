import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type Store from '@ember-data/store';

export interface SbomAppScanQueryParam {
  scan_limit: string;
  scan_offset: string;
  scan_query: string;
}

export interface SbomAppScanParam extends SbomAppScanQueryParam {
  sbom_project_id: string;
}

export default class AuthenticatedDashboardSbomAppScansRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  queryParams = {
    scan_limit: {
      refreshModel: true,
    },
    scan_offset: {
      refreshModel: true,
    },
    scan_query: {
      refreshModel: true,
    },
  };

  async model(params: SbomAppScanParam) {
    const {
      sbom_project_id,
      scan_limit = '10',
      scan_offset = '0',
      scan_query = '',
    } = params;

    const sbomProject = await this.store.findRecord(
      'sbom-project',
      sbom_project_id
    );

    const sbomPrj = await sbomProject.get('project');
    const projectLastFile = await sbomPrj.get('lastFile');

    return {
      sbomProject,
      projectLastFile,
      queryParams: { scan_limit, scan_offset, scan_query },
    };
  }
}
