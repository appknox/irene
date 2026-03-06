import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type SkAppsService from 'irene/services/sk-apps';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

export default class StoreknoxFakeAppsComponent extends Component {
  @service('sk-apps') declare skAppsService: SkAppsService;
  @service declare router: RouterService;

  @tracked searchQuery = '';

  @action
  onSearchQueryChange(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  @action
  clearSearchInput() {
    this.searchQuery = '';
  }

  get skFakeApps() {
    return this.skAppsService.skApps;
  }

  get totalAppsCount() {
    return this.skAppsService.skAppsCount;
  }

  get isFetchingTableData() {
    return this.skAppsService.isFetchingSkInventoryApps;
  }

  get showEmptyState() {
    return !this.isFetchingTableData && this.totalAppsCount === 0;
  }

  get showPagination() {
    return this.totalAppsCount > this.skAppsService.limit;
  }

  get hidePagination() {
    return this.showEmptyState || this.isFetchingTableData;
  }

  get defaultLimit() {
    return this.skAppsService.limit;
  }

  get offset() {
    return this.skAppsService.offset;
  }

  @action
  onItemPerPageChange(args: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: args.limit,
        app_offset: 0,
      },
    });
  }

  @action
  goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps': typeof StoreknoxFakeAppsComponent;
  }
}
