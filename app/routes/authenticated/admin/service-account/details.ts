import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedAdminServiceAccountDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model({ id }: { id: string }) {
    return {
      serviceAccount: await this.store.findRecord('service-account', id),
    };
  }
}
