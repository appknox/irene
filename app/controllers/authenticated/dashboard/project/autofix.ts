import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { ProjectAutofixModel } from 'irene/routes/authenticated/dashboard/project/autofix';

export default class AuthenticatedDashboardProjectAutofixController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['autofix_limit', 'autofix_offset', 'file_id'];

  autofix_limit = 10;
  autofix_offset = 0;
  file_id: string | number | undefined = undefined;

  declare model: ProjectAutofixModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('autofix.historyTitle'),
      route: 'authenticated.dashboard.project.autofix',
      models: [this.model.project.id],
      routeGroup: 'project/files',

      parentCrumb: {
        title: this.intl.t('allUploads'),
        route: 'authenticated.dashboard.project.files',
        models: [this.model.project.id],
        routeGroup: 'project/files',
      },
    };
  }
}
