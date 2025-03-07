import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type ProjectModel from 'irene/models/project';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardProjectSettingsIntegrationsController extends Controller {
  @service declare intl: IntlService;

  declare model: ProjectModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: `${this.intl.t('integration')} (${this.model.packageName})`,
      route: 'authenticated.dashboard.project.settings.integrations',
      models: [this.model?.id],
      routeGroup: 'project/files',

      siblingRoutes: [
        'authenticated.dashboard.project.settings.index',
        'authenticated.dashboard.project.settings.dast-automation',
        'authenticated.dashboard.project.settings.analysis',
      ],

      parentCrumb: {
        title: this.intl.t('allProjects'),
        route: 'authenticated.dashboard.projects',
        routeGroup: 'project/files',
      },
    };
  }
}
