import { service } from '@ember/service';

import type FileModel from 'irene/models/file';
import type OrganizationService from 'irene/services/organization';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardFileManualScanIndexRoute extends AkBreadcrumbsRoute {
  @service declare organization: OrganizationService;

  model() {
    const model = this.modelFor('authenticated.dashboard.file.manual-scan') as {
      file: FileModel;
    };

    return {
      ...model,
      organization: this.organization.selected,
    };
  }
}
