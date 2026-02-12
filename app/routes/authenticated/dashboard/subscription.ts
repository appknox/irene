import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type OrganizationService from 'irene/services/organization';
import type MeService from 'irene/services/me';
import type SubscriptionInfoModel from 'irene/models/subscription-info';

export default class AuthenticatedDashboardSubscriptionRoute extends ScrollToTop(
  Route
) {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare me: MeService;

  get selectedOrg() {
    return this.organization.selected;
  }

  beforeModel() {
    const isOwner = this.me.org?.is_owner;

    // Redirect if subscription page is not enabled or user is not owner
    if (!this.selectedOrg?.showSubscription || !isOwner) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  async model() {
    let orgSubInfo: SubscriptionInfoModel | null = null;

    try {
      const orgId = String(this.selectedOrg?.id);
      orgSubInfo = await this.store.findRecord('subscription-info', orgId);
    } catch (err) {
      const error = err as AdapterError;
      const status = error.errors?.[0]?.status;

      if (status === 403 || status === 404) {
        orgSubInfo = null;
      }
    }

    return {
      organization: this.selectedOrg,
      subscriptionInfo: orgSubInfo,
    };
  }
}
