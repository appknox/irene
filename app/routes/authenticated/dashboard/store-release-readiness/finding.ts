import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';

export type StoreReleaseReadinessFindingRouteModel = {
  finding: StoreReleaseReadinessFindingModel | undefined;
  scanId: string;
};

export default class AuthenticatedDashboardStoreReleaseReadinessFindingRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare store: Store;

  async model(params: {
    scan_id: string;
    finding_id: string;
  }): Promise<StoreReleaseReadinessFindingRouteModel> {
    const { scan_id, finding_id } = params;

    try {
      const finding = (await this.store.findRecord(
        'store-release-readiness-finding',
        finding_id,
        { reload: true }
      )) as StoreReleaseReadinessFindingModel;

      return { finding, scanId: scan_id };
    } catch (err) {
      const error = err as AdapterError;
      const status = error.errors?.[0]?.status;

      if (status === '404') {
        return { finding: undefined, scanId: scan_id };
      }

      throw err;
    }
  }

  redirect(model: StoreReleaseReadinessFindingRouteModel) {
    if (!model.finding) {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.scan-results',
        model.scanId
      );
    }
  }
}
