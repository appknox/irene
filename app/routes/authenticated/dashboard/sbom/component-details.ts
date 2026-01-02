import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type Store from 'ember-data/store';
import { service } from '@ember/service';

import type SbomComponentModel from 'irene/models/sbom-component';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

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

export default class AuthenticatedSbomComponentDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare store: Store;

  async model(params: SbomAppScanParam) {
    const {
      sbom_project_id,
      sbom_component_id,
      sbom_file_id,
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

  redirect(model: unknown, transition: Transition) {
    const currentRoute = transition.to?.name;

    if (
      currentRoute === 'authenticated.dashboard.sbom.component-details.index'
    ) {
      const { queryParams } = model as ComponentDetailsModel;
      const {
        sbom_project_id,
        sbom_file_id,
        sbom_component_id,
        sbom_component_parent_id,
      } = queryParams;

      this.router.transitionTo(
        'authenticated.dashboard.sbom.component-details.overview',
        sbom_project_id,
        sbom_file_id,
        sbom_component_id,
        sbom_component_parent_id
      );
    }
  }
}
