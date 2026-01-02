import Store from 'ember-data/store';
import { service } from '@ember/service';

import ENUMS from 'irene/enums';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardPrivacyModuleAppDetailsRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  async model({ app_id }: { app_id: string }) {
    const privacyProject = await this.store.findRecord(
      'privacy-project',
      app_id
    );

    const scanCompleted =
      privacyProject.latestFilePrivacyAnalysisStatus ===
      ENUMS.PM_STATUS.COMPLETED;

    return {
      privacyProject,
      scanCompleted,
    };
  }
}
