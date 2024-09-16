import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';
import type SkPendingReviewService from 'irene/services/sk-pending-review';

export default class StoreknoxDiscoverComponent extends Component {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare skPendingReview: SkPendingReviewService;

  @tracked showWelcomeModal = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    if (!this.me.org?.is_admin) {
      this.showWelcomeModal = false;
    }
  }

  get tabItems() {
    return [
      {
        id: 'discovery-results',
        route: 'authenticated.storeknox.discover.result',
        label: this.intl.t('storeknox.discoveryResults'),
      },
      this.me.org?.is_admin
        ? {
            id: 'pending-review',
            route: 'authenticated.storeknox.discover.review',
            label: this.intl.t('storeknox.pendingReview'),
            hasBadge: true,
            badgeCount: this.skPendingReview.totalCount,
          }
        : {
            id: 'requested-apps',
            route: 'authenticated.storeknox.discover.requested',
            label: this.intl.t('storeknox.requestedApps'),
          },
    ].filter(Boolean);
  }

  @action closeWelcomeModal() {
    this.showWelcomeModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover': typeof StoreknoxDiscoverComponent;
  }
}
