import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardServiceAccountCreateRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  queryParams = {
    duplicate: {
      refreshModel: true,
    },
  };

  async model({ duplicate: id }: { duplicate: string | null }) {
    return {
      duplicateServiceAccount: id
        ? await this.store.findRecord('service-account', id)
        : null,
    };
  }
}
