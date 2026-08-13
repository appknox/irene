import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardOffensiveSecurityScanRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  // The component fetches the record; the route only carries the id, matching
  // store-release-readiness.
  model({ scan_id }: { scan_id: string }) {
    return scan_id;
  }
}
