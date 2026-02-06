import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from 'ember-data/store';
import RouterService from '@ember/routing/router-service';

import OrganizationService from 'irene/services/organization';
import MeService from 'irene/services/me';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import SubscriptionInfoModel from 'irene/models/subscription-info';

export default class AuthenticatedDashboardSubscriptionRoute extends ScrollToTop(
  Route
) {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare me: MeService;

  async beforeModel() {
    const org = this.organization.selected;
    const isOwner = this.me.org?.is_owner;

    // Redirect if subscription page is not enabled or user is not owner
    if (!org?.showSubscription || !isOwner) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  async model() {
    let subscriptionInfo: SubscriptionInfoModel | null = null;

    try {
      subscriptionInfo = await this.store.findRecord(
        'subscription-info',
        this.organization.selected?.id as string
      );
    } catch (err) {
      const error = err as AdapterError;

      if (error.errors) {
        const status = error.errors[0]?.status;

        if (status === 403 || status == 404) {
          subscriptionInfo = null;
        }
      }
    }

    return {
      organization: this.organization.selected,
      subscriptionInfo: subscriptionInfo,
    };
  }
}
