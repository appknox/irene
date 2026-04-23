import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardStoreReleaseReadinessScanResultsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  model({ release_id }: { release_id: string }) {
    return release_id;
  }
}
