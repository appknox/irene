import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import type { FileOverdueVulnerabilitiesQueryParams } from 'irene/routes/authenticated/dashboard/file/overdue-vulnerabilities';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileOverdueVulnerabilitiesController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    file: FileModel;
    queryParams: Partial<FileOverdueVulnerabilitiesQueryParams>;
  };

  queryParams = ['limit', 'offset', 'ordering'];

  limit = 10;
  offset = 0;
  ordering = '-severity';

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const routeModels = [this.model.file.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('overdueVulnerabilities.title'),
      route: 'authenticated.dashboard.file.overdue-vulnerabilities',
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
