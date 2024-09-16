import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

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

  @tracked searchQuery = '';
  @tracked discoverClicked = false;

  constructor(owner: unknown, args: StoreknoxDiscoverResultsSignature['Args']) {
    super(owner, args);

    const { app_query } = args.queryParams;

    if (app_query) {
      this.discoverClicked = true;

      this.searchQuery = app_query;
    }
  }
  @action
  async discoverApp() {
    this.router.transitionTo('authenticated.storeknox.discover.result', {
      queryParams: { app_query: this.searchQuery, app_search_id: null },
    });

    if (this.discoverClicked) {
      const { app_limit, app_offset } = this.args.queryParams;

      this.skDiscoveryResult.uploadSearchQuery.perform(
        this.searchQuery,
        app_limit,
        app_offset
      );
    } else {
      this.discoverClicked = true;
    }
  }

  @action
  clearSearch() {
    this.searchQuery = '';
    this.discoverClicked = false;

    this.router.transitionTo('authenticated.storeknox.discover.result', {
      queryParams: {
        app_search_id: null,
        app_query: null,
        app_limit: null,
        app_offset: null,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results': typeof StoreknoxDiscoverResultsComponent;
  }
}
