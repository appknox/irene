import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFile extends Controller {
  @service declare intl: IntlService;

  declare model: { file: FileModel; profileId: number };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('scanDetails'),
      route: 'authenticated.dashboard.file',
      models: [this.model?.file?.id],
      routeGroup: 'project/files',

      parentCrumb: {
        title: this.intl.t('allProjects'),
        route: 'authenticated.dashboard.projects',
        routeGroup: 'project/files',
      },
    };
  }
}
