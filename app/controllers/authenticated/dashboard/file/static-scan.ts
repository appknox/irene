import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileStaticScan extends Controller {
  @service declare intl: IntlService;

  declare model: { file: FileModel };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const model = this.model;
    const routeModels = [model.file.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('sastResults'),
      route: 'authenticated.dashboard.file.static-scan',
      models: routeModels,
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
