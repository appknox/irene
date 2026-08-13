import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardOffensiveSecurityFindingRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  model({ scan_id, finding_id }: { scan_id: string; finding_id: string }) {
    return { scanId: scan_id, findingId: finding_id };
  }
}
