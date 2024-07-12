import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type FileModel from 'irene/models/file';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardFileManualScanIndexRoute extends Route {
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
