import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { DsNavigationGraphRouteModel } from 'irene/routes/authenticated/dashboard/ds-navigation-graph';

export default class AuthenticatedDashboardDsNavigationGraphController extends Controller {
  @service declare intl: IntlService;

  declare model: DsNavigationGraphRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const fileRouteModels = [this.model?.file?.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('navigationGraph.title'),
      route: 'authenticated.dashboard.ds-navigation-graph',
      models: [this.model?.dynamicscanId],
      routeGroup: 'project/files',
    };

    const dastCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('dast'),
      route: 'authenticated.dashboard.file.dynamic-scan.automated',
      models: fileRouteModels,
      routeGroup: 'project/files',
    };

    const scanDetailsCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('scanDetails'),
      route: 'authenticated.dashboard.file',
      models: fileRouteModels,
      routeGroup: 'project/files',
    };

    return {
      ...crumb,
      parentCrumb: dastCrumb,
      fallbackCrumbs: [
        {
          title: this.intl.t('allProjects'),
          route: 'authenticated.dashboard.projects',
        },
        scanDetailsCrumb,
        dastCrumb,
        crumb,
      ],
    };
  }
}
