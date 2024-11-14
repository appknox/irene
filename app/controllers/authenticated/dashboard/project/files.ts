import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { ProjectFilesModel } from 'irene/routes/authenticated/dashboard/project/files';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardProjectFilesController extends Controller {
  @service declare intl: IntlService;

  declare model: ProjectFilesModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('allUploads'),
      route: 'authenticated.dashboard.project.files',
      models: [this.model.project.id],
      multiPageAccess: true,
      routeGroup: 'project/files',

      parentCrumb: {
        title: this.intl.t('allProjects'),
        route: 'authenticated.dashboard.projects',
        routeGroup: 'project/files',
      },
    };
  }
}
