import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type ProjectModel from 'irene/models/project';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardProjectSettingsIndexController extends Controller {
  @service declare intl: IntlService;

  declare model: ProjectModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: `${this.intl.t('settings')} (${this.model?.packageName})`,
      route: 'authenticated.dashboard.project.settings.index',
      models: [this.model?.id],
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
