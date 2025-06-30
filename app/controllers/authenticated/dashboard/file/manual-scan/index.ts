import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileManualScanIndexController extends Controller {
  @service declare intl: IntlService;

  declare model: { file: FileModel };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const routeModels = [this.model?.file?.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('manualScan'),
      route: 'authenticated.dashboard.file.manual-scan.index',
      models: routeModels,
      siblingRoutes: ['authenticated.dashboard.file.manual-scan.results'],
      routeGroup: 'project/files',
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
