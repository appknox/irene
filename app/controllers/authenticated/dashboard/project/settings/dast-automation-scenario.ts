import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type ProjectModel from 'irene/models/project';
import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardProjectSettingsDastAutomationScenarioController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    project: ProjectModel;
    scenario: ScanParameterGroupModel;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const projectId = this.model?.project?.id;

    const crumb: AkBreadcrumbsItemProps = {
      title: `${this.intl.t('dastAutomation.dastAutomationScenario')}`,
      models: [projectId, this.model?.scenario?.id],
      routeGroup: 'project/files',

      route:
        'authenticated.dashboard.project.settings.dast-automation-scenario',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('settings')} (${this.model?.project?.get('packageName')})`,
      route: 'authenticated.dashboard.project.settings.index',
      models: [projectId],
      multiPageAccess: true,
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
