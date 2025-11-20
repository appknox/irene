import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { FileDASTResultsModel } from 'irene/routes/authenticated/dashboard/file/dynamic-scan/results';

export default class AuthenticatedDashboardFileDynamicScanResultsScanCoverageController extends Controller {
  @service declare intl: IntlService;

  declare model: FileDASTResultsModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const routeModels = [this.model.file.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('scanCoverage.title'),
      route: 'authenticated.dashboard.file.dynamic-scan.results.scan-coverage',
      models: routeModels,
      routeGroup: 'project/files',

      siblingRoutes: [
        'authenticated.dashboard.file.dynamic-scan.results.index',
        'authenticated.dashboard.file.dynamic-scan.results.apis-captured',
      ],
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('scanDetails'),
      route: 'authenticated.dashboard.file',
      models: routeModels,
      routeGroup: 'project/files',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [
        {
          title: this.intl.t('allProjects'),
          route: 'authenticated.dashboard.projects',
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
