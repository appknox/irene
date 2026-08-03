import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import { NavigationGraphRouteError } from 'irene/routes/authenticated/dashboard/ds-navigation-graph-error';

export default class AuthenticatedDashboardDsNavigationGraphErrorController extends Controller {
  @service declare intl: IntlService;

  declare model: NavigationGraphRouteError;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('navigationGraph.title'),
      route: 'authenticated.dashboard.ds-navigation-graph',
      routeGroup: 'project/files',
      models: ['#', '#'],
    };

    // File itself was invalid — trail anchors at All Projects.
    return {
      ...crumb,
      fallbackCrumbs: [
        {
          title: this.intl.t('home'),
          route: 'authenticated.dashboard',
        },
        {
          title: this.intl.t('allProjects'),
          route: 'authenticated.dashboard.projects',
        },
        ...(this.model.isFileValid
          ? [
              {
                title: this.intl.t('scanDetails'),
                route: 'authenticated.dashboard.file',
                routeGroup: 'project/files' as const,
                models: [this.model.fileId],
              },
            ]
          : []),
        crumb,
      ],
    };
  }
}
