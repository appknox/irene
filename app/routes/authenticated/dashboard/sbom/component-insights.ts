import { service } from '@ember/service';
import type Store from 'ember-data/store';

import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomFileModel from 'irene/models/sbom-file';
import type FileModel from 'irene/models/file';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface ComponentInsightsParams {
  sbom_project_id: string;
  sbom_file_id: string;
  sbom_component_id: string;
  sbom_component_parent_id: string;
}

export interface ComponentInsightsModel {
  sbomComponent: SbomComponentModel;
  sbomProject: SbomProjectModel;
  sbomFile: SbomFileModel;
  projectLastFile: FileModel;
  queryParams: ComponentInsightsParams;
}

/**
 * One-page reachability insights for a component. Loads the same records as
 * the tabbed component-details route; the `vuln` query param only selects
 * which vulnerability is shown, so it never re-runs the model.
 */
export default class AuthenticatedSbomComponentInsightsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  queryParams = {
    vuln: {
      refreshModel: false,
    },
  };

  async model(params: ComponentInsightsParams) {
    const {
      sbom_project_id,
      sbom_file_id,
      sbom_component_id,
      sbom_component_parent_id,
    } = params;

    const sbomComponent = await this.store.queryRecord('sbom-component', {
      sbomFileId: sbom_file_id,
      sbomComponentId: sbom_component_id,
    });

    const sbFileId = sbomComponent.sbFile?.get('id') as string;
    const sbomFile = await this.store.findRecord('sbom-file', sbFileId);
    const sbomProject = await sbomFile?.get('sbProject');
    const sbomPrj = await sbomProject.get('project');
    const projectLastFile = await sbomPrj.get('lastFile');

    return {
      sbomComponent,
      sbomProject,
      sbomFile,
      projectLastFile,
      queryParams: {
        sbom_project_id,
        sbom_file_id,
        sbom_component_id,
        sbom_component_parent_id,
      },
    };
  }
}
