import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type AuthenticatedOffensiveSecurityScanController from 'irene/controllers/authenticated/offensive-security/scan';

export default class AuthenticatedOffensiveSecurityScanRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  queryParams = {
    goal: { replace: false },
  };

  async model({ scan_id }: { scan_id: string }) {
    return this.store.findRecord('offsec-scan', scan_id);
  }

  resetController(
    controller: AuthenticatedOffensiveSecurityScanController,
    isExiting: boolean
  ) {
    if (isExiting) {
      controller.set('goal', null);
    }
  }
}
