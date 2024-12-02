import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type { ChooseFilesModel } from 'irene/routes/authenticated/dashboard/choose';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardChooseController extends Controller {
  @service declare intl: IntlService;

  declare model: ChooseFilesModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('fileCompare.fileSelection'),
      route: 'authenticated.dashboard.choose',
      models: [this.model?.file?.id as string],
      multiPageAccess: true,
      routeGroup: 'project/files',

      parentCrumb: {
        routeGroup: 'project/files',
        title: this.intl.t('scanDetails'),
        route: 'authenticated.dashboard.file',
        models: [this.model?.file?.id],
      },
    };
  }
}
