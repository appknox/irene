import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardStoreReleaseReadinessScanResultsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  model({ scan_id }: { scan_id: string }) {
    return scan_id;
  }
}
