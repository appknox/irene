import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';

import { StoreknoxDiscoveryResultQueryParam } from 'irene/routes/authenticated/storeknox/discover/result';
import SkDiscoveryResultService from 'irene/services/sk-discovery-result';

export interface StoreknoxDiscoverResultsSignature {
  Args: {
    queryParams: StoreknoxDiscoveryResultQueryParam;
  };
}

export default class StoreknoxDiscoverResultsComponent extends Component<StoreknoxDiscoverResultsSignature> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare skDiscoveryResult: SkDiscoveryResultService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked searchQuery = '';
  @tracked discoverClicked = false;
  @tracked showDisclaimerModal = false;

  constructor(owner: unknown, args: StoreknoxDiscoverResultsSignature['Args']) {
    super(owner, args);

    const { app_query } = args.queryParams;

    if (app_query) {
      this.discoverClicked = true;

      this.searchQuery = app_query;
    }
  }
  @action
  async discoverApp(event: SubmitEvent) {
    event.preventDefault();

    if (this.searchQuery.length > 1) {
      this.router.transitionTo('authenticated.storeknox.discover.result', {
        queryParams: { app_query: this.searchQuery, app_search_id: null },
      });

      if (this.discoverClicked) {
        const { app_limit } = this.args.queryParams;

        this.skDiscoveryResult.uploadSearchQuery.perform(
          this.searchQuery,
          app_limit,
          0,
          true
        );
      } else {
        this.discoverClicked = true;
      }
    } else {
      this.notify.error(this.intl.t('storeknox.errorSearchCharacter'));
    }
  }

  @action
  clearSearch() {
    this.searchQuery = '';
  }

  @action
  closeDisclaimerModal() {
    this.showDisclaimerModal = false;
  }

  @action
  viewMore() {
    this.showDisclaimerModal = true;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results': typeof StoreknoxDiscoverResultsComponent;
  }
}
