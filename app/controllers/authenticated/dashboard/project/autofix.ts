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

  get fileId() {
    const fileId = this.model?.queryParams?.file_id;

    if (fileId == null || fileId === '') {
      return null;
    }

    return String(fileId);
  }

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const projectId = String(this.model.project.id);

    return {
      title: this.intl.t('autofix.detailsTitle'),
      route: 'authenticated.dashboard.project.autofix',
      models: [projectId],
      routeGroup: 'project/files',

      parentCrumb: this.fileId
        ? {
            title: this.intl.t('scanDetails'),
            route: 'authenticated.dashboard.file.index',
            models: [this.fileId],
            routeGroup: 'project/files',
          }
        : {
            title: this.intl.t('allUploads'),
            route: 'authenticated.dashboard.project.files',
            models: [projectId],
            routeGroup: 'project/files',
          },
    };
  }
}
