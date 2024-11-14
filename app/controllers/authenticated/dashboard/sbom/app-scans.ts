import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomProjectModel from 'irene/models/sbom-project';
import type FileModel from 'irene/models/file';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardSbomAppScansController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    sbomProject: SbomProjectModel;
    projectLastFile: FileModel;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: `${this.intl.t('sbomModule.pastSbomAnalyses')} (${this.model.projectLastFile?.get('name')})`,
      route: 'authenticated.dashboard.sbom.app-scans',
      models: [this.model.sbomProject.id],
      routeGroup: 'sbom',

      parentCrumb: {
        title: this.intl.t('SBOM'),
        route: 'authenticated.dashboard.sbom.apps',
        routeGroup: 'sbom',
      },
    };
  }
}
