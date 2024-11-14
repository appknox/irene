import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type AnalysisModel from 'irene/models/analysis';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileAnalysisCompare extends Controller {
  @service declare intl: IntlService;

  declare model: AnalysisModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const fileId = this.model?.file?.get('id') as string;

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('vulnerabilityDetails'),
      route: 'authenticated.dashboard.file.analysis',
      models: [fileId, this.model?.id],
      multiPageAccess: true,
      routeGroup: 'project/files',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('scanDetails'),
      route: 'authenticated.dashboard.file',
      models: [fileId],
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
