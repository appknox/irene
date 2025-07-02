import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomFileModel from 'irene/models/sbom-file';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { SbomScanDetailParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';

export default class AuthenticatedDashboardSbomScanDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    projectLastFileName: string;
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel;
    queryParams: SbomScanDetailParam;
  };

  queryParams = [
    {
      component_limit: { type: 'number' as const },
    },
    {
      component_offset: { type: 'number' as const },
    },
    {
      component_query: { type: 'string' as const },
    },
    {
      is_dependency: { type: 'string' as const },
    },
    {
      component_type: { type: 'string' as const },
    },
    {
      view_type: { type: 'string' as const },
    },
  ];

  component_limit = 25;
  component_offset = 0;
  component_query = '';
  is_dependency = null;
  component_type = -1;
  view_type = 'tree';

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: `${this.intl.t('sbomModule.allComponentsAndVulnerabilities')} (${this.model.projectLastFileName})`,
      route: 'authenticated.dashboard.sbom.scan-details',
      models: [this.model.sbomProject.id, this.model.sbomFile.id],
      routeGroup: 'sbom',

      parentCrumb: {
        title: this.intl.t('SBOM'),
        route: 'authenticated.dashboard.sbom.apps',
        routeGroup: 'sbom',
      },
    };
  }
}
