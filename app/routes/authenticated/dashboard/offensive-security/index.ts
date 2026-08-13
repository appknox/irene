import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

import type {
  PlatformFilter,
  ResilienceFilter,
  SortDirection,
} from 'irene/components/offensive-security/attack-runs';

export interface OffensiveSecurityIndexRouteQueryParams {
  scan_limit: number;
  scan_offset: number;
  scan_query: string;
  scan_platform: PlatformFilter;
  scan_resilience: ResilienceFilter;
  scan_sort: SortDirection;
}

export default class AuthenticatedDashboardOffensiveSecurityIndexRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  queryParams = {
    scan_limit: { refreshModel: true },
    scan_offset: { refreshModel: true },
    scan_query: { refreshModel: true },
    scan_platform: { refreshModel: true },
    scan_resilience: { refreshModel: true },
    scan_sort: { refreshModel: true },
  };

  model(params: Partial<OffensiveSecurityIndexRouteQueryParams>) {
    const {
      scan_limit,
      scan_offset,
      scan_query,
      scan_platform,
      scan_resilience,
      scan_sort,
    } = params;

    return {
      queryParams: {
        scan_limit,
        scan_offset,
        scan_query,
        scan_platform,
        scan_resilience,
        scan_sort,
      },
    };
  }
}
