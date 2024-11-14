import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileDynamicScanManualController extends Controller {
  @service declare intl: IntlService;

  declare model: { file: FileModel; profileId: number };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const routeModels = [this.model?.file?.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('dast'),
      route: 'authenticated.dashboard.file.dynamic-scan.manual',
      models: routeModels,
      routeGroup: 'project/files',

      siblingRoutes: [
        'authenticated.dashboard.file.dynamic-scan.automated',
        'authenticated.dashboard.file.dynamic-scan.results',
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
