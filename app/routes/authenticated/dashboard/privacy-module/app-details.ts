import Store from '@ember-data/store';
import { service } from '@ember/service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedDashboardPrivacyModuleAppDetailsRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  async model({ app_id }: { app_id: string }) {
    return await this.store.findRecord('file', app_id);
  }
}
