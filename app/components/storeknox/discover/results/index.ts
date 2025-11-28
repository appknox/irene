import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type SkDiscoverySearchResultService from 'irene/services/sk-discovery-search-result';

export default class StoreknoxDiscoverResultsComponent extends Component {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare skDiscoverySearchResult: SkDiscoverySearchResultService;

  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked searchQuery = '';
  @tracked showDisclaimerModal = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.searchQuery = this.skDiscoverySearchResult.searchQuery ?? '';
  }

  @action
  async discoverApp(event: SubmitEvent) {
    event.preventDefault();

    if (this.searchQuery.length > 1) {
      this.router.transitionTo({
        queryParams: {
          app_offset: 0,
          app_query: this.searchQuery,
          app_search_id: null,
        },
      });

      // this.skDiscoverySearchResult.setQueryData({ searchId: '' });
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
