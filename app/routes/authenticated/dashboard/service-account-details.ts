import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardOrganizationSettingsServiceAccountDetailsRoute extends ScrollToTop(
  Route
) {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;

  get isPublicApiEnabled() {
    return this.organization.selected?.features?.public_apis;
  }

  get isOwnerOrAdmin() {
    return this.me.org?.get('is_owner') || this.me.org?.get('is_admin');
  }

  beforeModel() {
    if (this.isPublicApiEnabled && this.isOwnerOrAdmin) {
      return;
    }

    this.router.transitionTo('authenticated.dashboard.projects');
  }

  async model({ id }: { id: string }) {
    return {
      serviceAccount: await this.store.findRecord('service-account', id),
    };
  }
}
