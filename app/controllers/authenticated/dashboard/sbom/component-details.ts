import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomFileModel from 'irene/models/sbom-file';
import type FileModel from 'irene/models/file';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardSbomComponentDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    sbomComponent: SbomComponentModel;
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    projectLastFile: FileModel;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('sbomModule.componentDetails'),
      route: 'authenticated.dashboard.sbom.component-details.overview',
      routeGroup: 'sbom',

      models: [
        this.model.sbomProject.id,
        this.model.sbomFile.id,
        this.model.sbomComponent.id,
      ],
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('sbomModule.allComponentsAndVulnerabilities')} (${this.model.projectLastFile?.get('name')})`,
      route: 'authenticated.dashboard.sbom.scan-details',
      models: [this.model.sbomProject.id, this.model.sbomFile.id],
      routeGroup: 'sbom',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [
        {
          title: this.intl.t('SBOM'),
          route: 'authenticated.dashboard.sbom.apps',
          isRootCrumb: true,
          stopCrumbGeneration: true,
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
