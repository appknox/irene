import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { CompareChildrenRoutesModel } from 'irene/routes/authenticated/dashboard/compare';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardCompareResolvedTestCasesController extends Controller {
  @service declare intl: IntlService;

  declare model: CompareChildrenRoutesModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const [file1, file2] = this.model?.files || [];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('fileCompare.resolvedIssues'),
      route: 'authenticated.dashboard.compare.resolved-test-cases',
      models: [`${file1?.id}...${file2?.id}`],
      routeGroup: 'project/files',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('fileCompare.fileSelection'),
      route: 'authenticated.dashboard.choose',
      models: [file1?.id as string],
      routeGroup: 'project/files',
    };

    return {
      ...crumb,
      parentCrumb,

      siblingRoutes: [
        'authenticated.dashboard.compare.index',
        'authenticated.dashboard.compare.new-issues',
        'authenticated.dashboard.compare.untested-cases',
      ],

      fallbackCrumbs: [
        {
          title: this.intl.t('allProjects'),
          route: 'authenticated.dashboard.projects',
        },
        {
          route: 'authenticated.dashboard.file',
          title: `${this.intl.t('scanDetails')}`,
          models: [file1?.id as string],
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
