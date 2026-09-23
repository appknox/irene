import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { FileAutofixModel } from 'irene/routes/authenticated/dashboard/file/autofix';

export default class AuthenticatedDashboardFileAutofixController extends Controller {
  @service declare intl: IntlService;

  queryParams = ['autofix_limit', 'autofix_offset'];

  autofix_limit = 10;
  autofix_offset = 0;

  declare model: FileAutofixModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('autofix.historyTitle'),
      route: 'authenticated.dashboard.file.autofix',
      models: [this.model.file.id],
      routeGroup: 'project/files',

      parentCrumb: {
        title: this.intl.t('scanDetails'),
        route: 'authenticated.dashboard.file.index',
        models: [this.model.file.id],
        routeGroup: 'project/files',
      },
    };
  }
}
