import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

export interface SbomScanComponentQueryParam {
  component_limit: string;
  component_offset: string;
  component_query: string;
}

export interface SbomScanDetailParam extends SbomScanComponentQueryParam {
  sbom_app_id: string;
  sbom_scan_id: string;
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
      sbom_app_id,
      sbom_scan_id,
      component_limit = '25',
      component_offset = '0',
      component_query = '',
    } = params;

    const sbomApp = await this.store.findRecord('sbom-app', sbom_app_id);

    const sbomScan = await this.store.findRecord('sbom-scan', sbom_scan_id);

    const sbomScanSummary = await this.store.queryRecord('sbom-scan-summary', {
      sbomAppId: sbom_app_id,
      sbomScanId: sbom_scan_id,
    });

    return {
      sbomApp,
      sbomScan,
      sbomScanSummary,
      queryParams: { component_limit, component_offset, component_query },
    };
  }
}
