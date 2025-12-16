import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { FileVulCompareRouteModel } from 'irene/routes/authenticated/dashboard/file-vul-compare';

export default class AuthenticatedDashboardFileVulCompare extends Controller {
  @service declare intl: IntlService;

  declare model: FileVulCompareRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const { file1, file2, vulnerability } = this.model;
    const filesModel = `${file1?.id}...${file2?.id}`;

    return {
      title: this.intl.t('testCase'),
      route: 'authenticated.dashboard.file-vul-compare',
      models: [filesModel, vulnerability?.get?.('id')],
      routeGroup: 'project/files',

      parentCrumb: {
        routeGroup: 'project/files',
        title: this.intl.t('allProjects'),
        route: 'authenticated.dashboard.projects',
      },

      fallbackCrumbs: [
        {
          route: 'authenticated.dashboard.projects',
          title: this.intl.t('allProjects'),
        },
        {
          route: 'authenticated.dashboard.file',
          title: `${this.intl.t('scanDetails')}`,
          models: [file1?.id],
        },
        {
          route: 'authenticated.dashboard.choose',
          title: this.intl.t('fileCompare.fileSelection'),
          models: [file1?.id],
        },
        {
          title: this.intl.t('fileCompare.recurringIssues'),
          route: 'authenticated.dashboard.compare.index',
          models: [`${file1?.id}...${file2?.id}`],
          routeGroup: 'project/files',
        },
        {
          route: 'authenticated.dashboard.file-vul-compare',
          title: this.intl.t('testCase'),
          models: [filesModel, vulnerability.get('id')],
        },
      ],
    };
  }
}
