import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type ProjectModel from 'irene/models/project';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardProjectSettingsDastAutomationController extends Controller {
  @service declare intl: IntlService;

  declare model: ProjectModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('allProjects'),
      route: 'authenticated.dashboard.projects',
      routeGroup: 'project/files',
    };

    const crumb: AkBreadcrumbsItemProps = {
      title: `${this.intl.t('dastAutomation.title')} (${this.model.packageName})`,
      route: 'authenticated.dashboard.project.settings.dast-automation',
      models: [this.model?.id],

      siblingRoutes: [
        'authenticated.dashboard.project.settings.index',
        'authenticated.dashboard.project.settings.analysis',
      ],

      routeGroup: 'project/files',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [parentCrumb, crumb],
    };
  }
}
