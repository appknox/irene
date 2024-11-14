import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardProjects extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('allProjects'),
      route: 'authenticated.dashboard.projects',
      isRootCrumb: true,
      stopCrumbGeneration: true,
      routeGroup: 'project/files',
    };
  }
}
