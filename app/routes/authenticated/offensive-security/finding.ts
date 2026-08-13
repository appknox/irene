import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedOffensiveSecurityFindingRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model({
    scan_id,
    finding_id,
  }: {
    scan_id: string;
    finding_id: string;
  }) {
    const [scan, finding] = await Promise.all([
      this.store.findRecord('offsec-scan', scan_id),
      this.store.findRecord('offsec-finding', finding_id),
    ]);

    return { scan, finding };
  }
}
